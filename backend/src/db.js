const bcrypt = require('bcryptjs');
const config = require('./config');

const isPostgres = config.DB_DRIVER === 'postgres';

let pool = null;
let sqlite = null;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
`;

const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

// PostgreSQL utilise $1, $2... ; SQLite et notre code restent sur '?'
function toPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function init() {
  if (isPostgres) {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: config.DATABASE_URL });
    // Sans ce handler, une connexion inactive coupée (redémarrage de PG) fait
    // planter tout le process Node avec « Unhandled 'error' event ».
    pool.on('error', (err) => {
      console.error('[DB] connexion PostgreSQL inactive perdue :', err.message);
    });
    await pool.query('SELECT 1');
    await pool.query(POSTGRES_SCHEMA);
  } else {
    const Database = require('better-sqlite3');
    sqlite = new Database(config.DB_PATH);
    sqlite.pragma('journal_mode = ' + (config.DB_PATH === ':memory:' ? 'memory' : 'wal'));
    sqlite.pragma('foreign_keys = ON');
    sqlite.exec(SQLITE_SCHEMA);
  }
  await seed();
}

async function get(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(toPlaceholders(sql), params);
    return res.rows[0] || null;
  }
  return sqlite.prepare(sql).get(...params) || null;
}

async function all(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(toPlaceholders(sql), params);
    return res.rows;
  }
  return sqlite.prepare(sql).all(...params);
}

async function run(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(toPlaceholders(sql), params);
    const row = res.rows[0] || {};
    return { lastInsertRowid: row.id ?? null, changes: res.rowCount };
  }
  const info = sqlite.prepare(sql).run(...params);
  return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
}

async function seed() {
  const userCount = Number((await get('SELECT COUNT(*) AS c FROM users')).c);
  if (userCount === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    await run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      'admin@smartcampus.com',
      hash,
      'admin',
    ]);
    await run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      'etudiant@smartcampus.com',
      bcrypt.hashSync('password123', 10),
      'student',
    ]);
  }

  const roomCount = Number((await get('SELECT COUNT(*) AS c FROM rooms')).c);
  if (roomCount === 0) {
    const rooms = [
      ['Amphi A', 120],
      ['B101', 30],
      ['B102', 30],
      ['Labo Info', 24],
    ];
    for (const [name, capacity] of rooms) {
      await run('INSERT INTO rooms (name, capacity) VALUES (?, ?)', [name, capacity]);
    }
  }
}

async function close() {
  if (isPostgres) {
    if (pool) await pool.end();
    pool = null;
  } else if (sqlite) {
    sqlite.close();
    sqlite = null;
  }
}

module.exports = { init, get, all, run, close, driver: config.DB_DRIVER };

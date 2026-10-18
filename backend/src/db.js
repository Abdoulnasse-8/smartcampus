const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const config = require('./config');

const db = new Database(config.DB_PATH);
db.pragma('journal_mode = ' + (config.DB_PATH === ':memory:' ? 'memory' : 'wal'));
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
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
  `);

  seed();
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    insertUser.run('admin@smartcampus.com', hash, 'admin');
    insertUser.run('etudiant@smartcampus.com', bcrypt.hashSync('password123', 10), 'student');
  }

  const roomCount = db.prepare('SELECT COUNT(*) AS c FROM rooms').get().c;
  if (roomCount === 0) {
    const insertRoom = db.prepare('INSERT INTO rooms (name, capacity) VALUES (?, ?)');
    insertRoom.run('Amphi A', 120);
    insertRoom.run('B101', 30);
    insertRoom.run('B102', 30);
    insertRoom.run('Labo Info', 24);
  }
}

module.exports = { db, init };

require('dotenv').config();

// Driver : 'sqlite' (défaut — tests et docker run simple)
// ou 'postgres' (activé si DB_DRIVER=postgres ou si DATABASE_URL est fourni)
const DB_DRIVER =
  process.env.DB_DRIVER ||
  (process.env.DATABASE_URL ? 'postgres' : 'sqlite');

module.exports = {
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET || 'smartcampus-dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_DRIVER,
  DB_PATH: process.env.DB_PATH || 'smartcampus.db',
  DATABASE_URL: process.env.DATABASE_URL || '',
};

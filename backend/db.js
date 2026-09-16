const { Pool } = require('pg');

const requiredConfig = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingConfig = requiredConfig.filter((name) => !process.env[name]);

if (missingConfig.length > 0) {
  throw new Error(`Missing database configuration: ${missingConfig.join(', ')}`);
}

const port = Number(process.env.DB_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;

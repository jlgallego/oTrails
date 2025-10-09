const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'sdrpidb01',
  database: 'oTrails_d',
  password: 'eol*1024',
  port: 5432,
});

module.exports = pool;

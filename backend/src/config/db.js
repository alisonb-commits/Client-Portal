const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(1);
});

// Helper so we don't have to call pool.query() everywhere
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };

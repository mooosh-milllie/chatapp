const {Pool} = require('pg');
const CONFIG = require('./config');

const pool = new Pool({
  database: CONFIG.DATABASE_NAME,
  user: CONFIG.DATABASE_USER,
  host: CONFIG.DATABASE_HOST,
  port: CONFIG.DATABASE_PORT,
  password: CONFIG.DATABASE_PASSWORD
})

module.exports = pool;
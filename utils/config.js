require('dotenv').config();
const SALT_ROUND = process.env.SALT_ROUND;
const CONFIG = {
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_HOST: process.env.DATABASE_HOST,
  SALT_ROUND: Number(SALT_ROUND),
  COOKIE_SECRET: process.env.COOKIE_SECRET
}


module.exports = CONFIG;
const redisClient = require("../utils/redisClient")
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const CONFIG = require('../utils/config');
const sessionMiddleware = session({
  secret: CONFIG.COOKIE_SECRET,
  credentials: true,
  name:'sid',
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    client: redisClient
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production'? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
})

module.exports = sessionMiddleware;
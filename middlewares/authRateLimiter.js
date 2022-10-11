const redisClient = require("../utils/redisClient");

module.exports.authRateLimiter = (attemptsLimit, timeToLive) =>  
async (req, res, next) => {
  const clientIp = req.ip;
  const [authAttempts] = await redisClient.multi().incr(clientIp).expire(clientIp, timeToLive).exec();
  console.log(authAttempts);
  if (authAttempts[1] > attemptsLimit) {
    return res.json({loggedIn: false, status: 'Rate Limit Reached'})
  }
  next();
}
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

const securityMiddleware = (app) => {
  app.use(helmet()); // Adds security headers to your app
  app.use(limiter); // Apply rate limiter
};

module.exports = securityMiddleware;

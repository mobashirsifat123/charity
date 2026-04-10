const rateLimit = require('express-rate-limit');

// General Rate Limiter (For all standard API endpoints)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        success: false,
        message: 'Too many requests generated from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Strict Rate Limiter (For sensitive endpoints like Authentication or Donations)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: {
        success: false,
        message: 'Too many sensitive operations requested from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    strictLimiter
};

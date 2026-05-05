import  rateLimit   from    'express-rate-limit';

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100, 
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 10 minutes',
        data: null
    },
    standardHeaders: true, 
    legacyHeaders: false,
});
export  default apiLimiter;
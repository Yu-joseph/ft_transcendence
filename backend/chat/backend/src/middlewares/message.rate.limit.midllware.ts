import {rateLimit} from    'express-rate-limit';

const   MAX_MESSAGE_REQ = 20;

export  const   messageLimiter = rateLimit({
    windowMs: 10 * 1000,
    limit: MAX_MESSAGE_REQ,
    message: {
        success: false,
        message: 'You are sending message too fast. rrta7 chwiya.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
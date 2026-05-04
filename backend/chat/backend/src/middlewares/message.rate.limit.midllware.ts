import {rateLimit} from    'express-rate-limit';

const   MAX_MESSAGE_REQ = 500;

export  const   messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: MAX_MESSAGE_REQ,
    message: {
        success: false,
        message: 'You are sending message too fast. rrta7 chwiya.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false
});
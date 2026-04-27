import  {rateLimit}  from 'express-rate-limit';

const MAX_REQ = 5

export  const friendRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 100,
  limit: MAX_REQ,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: `You can only send ${MAX_REQ} friend request per 1 hour.`
  },
  standardHeaders: true,
  legacyHeaders: false
});
import  {rateLimit}  from 'express-rate-limit';

const MAX_REQ = 10

export  const friendRequestLimiter = rateLimit({
  windowMs: 100 * 60 * 100,
  limit: MAX_REQ,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: `You can only send ${MAX_REQ} friend request per 10 minutes.`
  },
  standardHeaders: true,
  legacyHeaders: false
});
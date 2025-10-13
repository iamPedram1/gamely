import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 5, // max 5 requests per 1 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login attempts. Please try again later.',
  },
});

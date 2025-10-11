// middleware/rate-limiters.ts
import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 5, // max 5 requests per 5 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login attempts. Please try again later.',
  },
});

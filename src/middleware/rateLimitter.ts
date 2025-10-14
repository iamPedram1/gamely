import { rateLimit } from 'express-rate-limit';
import { t } from 'utilites/request-context';

export const limitier = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 5, // max 5 requests per 1 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    error: t('error.too_many_request'),
  },
});

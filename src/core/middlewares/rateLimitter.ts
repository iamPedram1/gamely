import { rateLimit } from 'express-rate-limit';
import sendResponse from 'core/utilites/response';

export const limitier = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 5, // max 5 requests per 1 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    sendResponse(res, 429, {
      body: { message: req.t('error.too_many_request') },
    });
  },
});

import { rateLimit } from 'express-rate-limit';
import sendResponse from 'core/utilities/response';

/**
 * Custom rate limiter factory
 * @param limit - max requests
 * @param ms - window duration in milliseconds
 * @param messageFn - optional function to generate message dynamically
 */
export const limiter = (
  limit: number = 5,
  ms: number = 60 * 1000,
  message:
    | 'error.try_again_after'
    | 'error.too_many_request' = 'error.too_many_request'
) =>
  rateLimit({
    windowMs: ms,
    limit: process.env.NODE_ENV === 'test' ? 1000 : limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      const retryAfterSec =
        Number(res.getHeader('Retry-After')) || Math.ceil(ms / 1000);

      sendResponse(res, 429, {
        body: { message: req.t(message, { seconds: String(retryAfterSec) }) },
      });
    },
  });

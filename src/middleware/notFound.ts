import type { Request, Response, NextFunction } from 'express';
import logger from 'utilites/logger';

export default function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Not found route -> ' + req.url);
  res.status(400).send('Something went very wrong.');
}

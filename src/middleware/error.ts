import type { Request, Response, NextFunction } from 'express';
import logger from 'utilites/logger';
import { ValidationError } from 'utilites/errors';

export default function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(error.message, error.stack);

  if (error instanceof ValidationError)
    return res.status(400).send(error.message);

  res.status(500).send('Interntal server error');
}

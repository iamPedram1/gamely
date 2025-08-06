import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import logger from 'utilites/logger';

export default function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(error.message, error.stack);
  res.status(400).send('Something went very wrong.');
}

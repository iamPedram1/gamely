import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';

export default function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('Not-found middleware');
  res.status(400).send('Something went very wrong.');
}

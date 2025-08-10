import ApiResponse from 'utilites/response';
import type { Request, Response, NextFunction } from 'express';

export default function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = 404;

  const response = new ApiResponse(
    { status },
    { message: `The requested path '${req.url}' could not be found.` }
  );

  res.status(status).send(response);
}

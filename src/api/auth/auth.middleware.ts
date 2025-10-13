import type { Request, Response, NextFunction } from 'express';

// Utilites
import { jwtCookieName } from 'utilites/configs';
import { BadRequestError } from 'utilites/errors';

export default function blockRequestWithToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtCookieName);
  if (token) throw new BadRequestError('Bad Request');

  next();
}

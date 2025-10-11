import type { Request, Response, NextFunction } from 'express';

// Utilites
import { jwtCookieName } from 'utilites/configs';

export default function blockRequestWithToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtCookieName);
  if (token) return res.status(400).send('Bad Request');

  next();
}

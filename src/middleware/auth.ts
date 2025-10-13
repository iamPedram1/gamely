import jwt from 'jsonwebtoken';

// Models
import User from 'api/user/user.model';

// Utilities
import { UnauthorizedError } from 'utilites/errors';
import { jwtPrivateKey, jwtCookieName } from 'utilites/configs';

// Types
import type { Request, Response, NextFunction } from 'express';

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtCookieName);
  if (!token) throw new UnauthorizedError('Access denied. No token provided.');

  console.log(token);
  const decoded = jwt.verify(token, jwtPrivateKey) as { _id: string };
  console.log(decoded);

  const user = await User.findById({ _id: decoded._id }).lean();
  console.log(user);
  if (!user)
    throw new UnauthorizedError('Access denied. Invalid or expired token.');
  req.user = decoded;

  next();
}

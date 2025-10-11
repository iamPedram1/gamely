import jwt from 'jsonwebtoken';

// Models
import User from 'api/user/user.model';

// Utilities
import { UnauthorizedError } from 'utilites/errors';
import { jwtPrivateKey, tokenHeaderName } from 'utilites/configs';

// Types
import type { Request, Response, NextFunction } from 'express';

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(tokenHeaderName);
  if (!token) throw new UnauthorizedError('Access denied. No token provided.');

  const decoded = jwt.verify(token, jwtPrivateKey) as { _id: string };
  const user = await User.findById({ _id: decoded._id }).lean();
  if (!user)
    throw new UnauthorizedError('Access denied. Invalid or expired token.');
  req.user = decoded;

  next();
}

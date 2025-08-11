import jwt from 'jsonwebtoken';

// Models
import User from 'api/user/user.model';

// Utilities
import { jwtPrivateKey, tokenHeaderName } from 'utilites/configs';

// Types
import type { Request, Response, NextFunction } from 'express';

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(tokenHeaderName);
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, jwtPrivateKey) as { _id: string };
    const user = await User.findById({ _id: decoded._id });
    if (!user) throw new Error();
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).send('Access denied. Invalid or expired token.');
  }
}

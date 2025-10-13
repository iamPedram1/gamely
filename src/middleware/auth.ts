import jwt from 'jsonwebtoken';

// Models
import User, { IRefreshToken, IToken } from 'api/user/user.model';

// Utilities
import { AnonymousError, UnauthorizedError } from 'utilites/errors';
import {
  jwtTokenKey,
  jwtTokenName,
  jwtRefreshTokenKey,
} from 'utilites/configs';

// Types
import type { Request, Response, NextFunction } from 'express';

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const mask = 'Access denied. Invalid or expired token.';

  try {
    const token = req.header(jwtTokenName);
    if (!token) {
      return next(new UnauthorizedError('Access denied. No token provided.'));
    }

    // Step 1: Verify access token
    const payload = verifyAccessToken(token);

    // Step 2: Fetch user with matching token
    const user = await findUserByToken(payload.userId, token);
    if (!user) {
      return next(
        new AnonymousError(
          `User with token (${token}) was not found`,
          mask,
          401,
          {
            cause: ['User not found or token mismatch'],
          }
        )
      );
    }

    // Step 3: Ensure refresh token exists
    if (!user.refreshToken) {
      return next(
        new AnonymousError('User refresh token missing', mask, 401, {
          cause: ['refreshToken not found in user document'],
        })
      );
    }

    // Step 4: Validate refresh token linkage
    if (!isRefreshTokenLinked(user.refreshToken, token)) {
      return next(
        new AnonymousError(
          'RefreshToken.token did not match the db.user.token',
          mask
        )
      );
    }

    // ✅ Authenticated successfully
    req.user = { _id: payload.userId, email: payload.userEmail };
    return next();
  } catch (error) {
    return next(handleJwtError(error, mask));
  }
}

function verifyAccessToken(token: string): IToken {
  try {
    return jwt.verify(token, jwtTokenKey) as IToken;
  } catch (err) {
    throw err; // handled later by handleJwtError()
  }
}

async function findUserByToken(userId: string, token: string) {
  return User.findOne({ _id: userId, token })
    .select('+token +refreshToken')
    .lean();
}

function isRefreshTokenLinked(refreshToken: string, token: string): boolean {
  const payload = jwt.verify(refreshToken, jwtRefreshTokenKey) as IRefreshToken;
  return payload.token === token;
}

function handleJwtError(error: Error, mask: string): Error {
  if (error instanceof jwt.TokenExpiredError)
    return new UnauthorizedError('Token is expired');
  if (error instanceof jwt.JsonWebTokenError)
    return new UnauthorizedError('Token is invalid');
  return new AnonymousError(error.message, mask);
}

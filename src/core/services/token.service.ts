import jwt from 'jsonwebtoken';

// Utilites
import { t } from 'core/utilities/request-context';
import { InternalServerError, ValidationError } from 'core/utilities/errors';
import {
  jwtRefreshTokenExpiresInDays,
  jwtRefreshTokenKey,
  jwtAccessTokenExpiresInMinutes,
  jwtAccessTokenKey,
} from 'features/shared/auth/session/session.constants';

const tokenUtils = {
  verify<T>(token: string, secret: string, name: string) {
    try {
      return jwt.verify(token, secret) as T;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new ValidationError(t('error.jwt.verify_expired', { name }));
      if (error instanceof jwt.JsonWebTokenError)
        throw new ValidationError(t('error.jwt.verify_invalid', { name }));

      throw new InternalServerError();
    }
  },
  generateAccessToken(userId: string, sessionId: string) {
    const obj = { userId, sessionId };

    return jwt.sign(obj, jwtAccessTokenKey, {
      expiresIn: `${jwtAccessTokenExpiresInMinutes}m`,
    });
  },
  generateRefreshToken(userId: string, sessionId: string) {
    const obj = { userId, sessionId };
    return jwt.sign(obj, jwtRefreshTokenKey, {
      expiresIn: `${jwtRefreshTokenExpiresInDays}d`,
    });
  },
};

export default tokenUtils;

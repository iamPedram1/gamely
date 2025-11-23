import jwt from 'jsonwebtoken';

// Utilites
import logger from 'core/utilities/logger';
import { t } from 'core/utilities/request-context';
import { AnonymousError, UnauthorizedError } from 'core/utilities/errors';
import {
  jwtRefreshTokenExpiresInDays,
  jwtRefreshTokenKey,
  jwtAccessTokenExpiresInMinutes,
  jwtAccessTokenKey,
} from 'features/shared/auth/session/session.constant';

const tokenUtils = {
  decode<T>(token: string) {
    try {
      return jwt.decode(token) as T;
    } catch (error) {
      throw new AnonymousError(error.message);
    }
  },
  verify<T>(token: string, secret: string, name: string) {
    try {
      return jwt.verify(token, secret) as T;
    } catch (error) {
      logger.error(error);

      if (error instanceof jwt.TokenExpiredError)
        throw new UnauthorizedError(t('error.jwt.verify_expired', { name }));
      if (error instanceof jwt.JsonWebTokenError)
        throw new UnauthorizedError(t('error.jwt.verify_invalid', { name }));

      throw new UnauthorizedError(t('error.unauthorized_error'));
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

import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

// Utilites
import { t } from 'core/utilites/request-context';
import { InternalServerError, ValidationError } from 'core/utilites/errors';
import {
  jwtRefreshTokenExpiresInDays,
  jwtRefreshTokenKey,
  jwtAccessTokenExpiresInMinutes,
  jwtAccessTokenKey,
} from 'features/shared/auth/auth.constants';

const tokenUtils = {
  verify<T>(token: string, secret: string, name: string) {
    try {
      return jwt.verify(token, secret) as T;
    } catch (error) {
      console.log({ error, token, secret, name });
      if (error instanceof jwt.TokenExpiredError)
        throw new ValidationError(t('error.jwt.verify_expired', { name }));
      if (error instanceof jwt.JsonWebTokenError)
        throw new ValidationError(t('error.jwt.verify_invalid', { name }));

      throw new InternalServerError();
    }
  },
  generateToken(userId: Types.ObjectId) {
    const obj = { userId: userId.toHexString() };

    return jwt.sign(obj, jwtAccessTokenKey, {
      expiresIn: `${jwtAccessTokenExpiresInMinutes}m`,
    });
  },
  generateRefreshToken(id: Types.ObjectId) {
    const obj = { userId: id.toHexString() };
    return jwt.sign(obj, jwtRefreshTokenKey, {
      expiresIn: `${jwtRefreshTokenExpiresInDays}d`,
    });
  },
};

export default tokenUtils;

import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

// Utilites
import crypto from 'core/utilites/crypto';
import {
  jwtRefreshTokenExpiresInDays,
  jwtRefreshTokenKey,
  jwtAccessTokenExpiresInMinutes,
  jwtAccessTokenKey,
} from 'core/utilites/configs';

const tokenUtils = {
  generateToken(userId: Types.ObjectId) {
    const obj = { userId: userId.toHexString() };
    return jwt.sign(obj, jwtAccessTokenKey, {
      expiresIn: jwtAccessTokenExpiresInMinutes as `${number}m`,
    });
  },
  async generateRefreshToken(id: Types.ObjectId) {
    const obj = { userId: id.toHexString() };
    return await crypto.hash(
      jwt.sign(obj, jwtRefreshTokenKey, {
        expiresIn: `${jwtRefreshTokenExpiresInDays}d`,
      })
    );
  },
};

export default tokenUtils;

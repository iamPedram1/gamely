import logger from 'core/utilities/logger';
import User from 'features/shared/user/core/user.model';
import tokenUtils from 'core/services/token.service';
import { Request, Response, NextFunction } from 'express';
import { requestContext, runWithContext } from 'core/utilities/request-context';
import {
  jwtAccessTokenKey,
  jwtAccessTokenName,
} from 'features/shared/auth/session/session.constant';
import type { IToken } from 'features/shared/auth/session/session.types';

export const context = (req: Request, res: Response, next: NextFunction) => {
  runWithContext({ user: req.user, i18n: req.i18n, t: req.t }, next);
};

export const initializeContext = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header(jwtAccessTokenName);
    if (!token) return next();

    const ctx = requestContext.getStore();

    if (req.user) {
      if (ctx) ctx.user = req.user;
    } else {
      const { userId, sessionId } = tokenUtils.verify(
        token,
        jwtAccessTokenKey,
        req.t('common.token')
      ) as IToken;

      const user = await User.findOne({ _id: userId })
        .lean()
        .select('username email role status');

      if (user) {
        req.user = {
          id: userId,
          username: user.username,
          email: user.email,
          role: user.role,
          sessionId,
        };

        if (ctx) ctx.user = req.user;
      }
    }
  } catch (error) {
    logger.error(error);
  }
  return next();
};

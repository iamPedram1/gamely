// Models
import User from 'features/shared/user/user.model';

// Middlewares
import { requestContext, t } from 'core/utilities/request-context';

// Utilities
import tokenUtils from 'core/services/token.service';
import {
  jwtAccessTokenKey,
  jwtAccessTokenName,
} from 'features/shared/session/session.constants';
import {
  AnonymousError,
  ForbiddenError,
  UnauthorizedError,
} from 'core/utilities/errors';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from 'features/shared/user/user.types';
import type { IToken } from 'features/shared/session/session.types';

export default function auth(roles: UserRole[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const mask = req.t('error.token_generic_error');
    const token = req.header(jwtAccessTokenName);

    if (!token) {
      throw new UnauthorizedError(
        req.t('error.jwt.verify_missing', { name: t('common.token') })
      );
    }

    // Check JWT
    const { userId, sessionId } = tokenUtils.verify<IToken>(
      token,
      jwtAccessTokenKey,
      t('common.token')
    );

    // Check User Exists
    const user = await User.findById(userId).lean();
    if (!user)
      return next(
        new AnonymousError('User with given id does not exist', mask, 400)
      );

    // Check Status
    if (user.status === 'blocked')
      throw new ForbiddenError(t('error.user.is_blocked'));

    // Check Role
    if (!roles.includes(user.role))
      throw new AnonymousError(
        `Expected (${roles}) role but the role was (${user.role})`,
        t('error.forbidden_error'),
        403
      );

    req.user = {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId,
    };

    const ctx = requestContext.getStore();
    if (ctx) ctx.user = req.user;

    return next();
  };
}

// Models
import User from 'features/shared/user/user.model';

// Middlewares
import { requestContext, t } from 'core/utilites/request-context';

// Utilities
import tokenUtils from 'core/services/token.service';
import {
  jwtAccessTokenKey,
  jwtTokenName,
} from 'features/shared/auth/auth.constants';
import { AnonymousError, UnauthorizedError } from 'core/utilites/errors';

// Types
import type { IToken } from 'features/shared/user/user.model';
import type { UserRole } from 'features/shared/user/user.types';
import type { Request, Response, NextFunction } from 'express';

export default function auth(roles: UserRole[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const mask = req.t('error.token_generic_error');
    const token = req.header(jwtTokenName);

    if (!token) {
      throw new UnauthorizedError(
        req.t('error.jwt.verify_missing', { name: t('common.token') })
      );
    }

    // Check JWT
    const { userId } = tokenUtils.verify<IToken>(
      token,
      jwtAccessTokenKey,
      t('common.token')
    );

    // Check Role
    const user = await User.findById(userId).select('role').lean();
    if (!user)
      return next(
        new AnonymousError('User with given id does not exist', mask, 400)
      );

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
    };

    const ctx = requestContext.getStore();
    if (ctx) ctx.user = req.user;

    return next();
  };
}

import { container } from 'tsyringe';
import type { Request, Response, NextFunction } from 'express';

// Model
import UserBanService from 'features/management/user/ban/ban.service';

// Utilities
import { AnonymousError, ForbiddenError } from 'core/utilities/errors';

const banService = container.resolve(UserBanService);

export async function validateBanStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) throw new AnonymousError('user data was empty in req.body');

  const ban = await banService.getUserBan(req.user.id);

  if (ban)
    throw new ForbiddenError(
      'Your have been suspended by adminstartor' +
        `till ${ban.endAt?.getUTCDate()}`
    );

  next();
}

import type { Request, Response, NextFunction } from 'express';

// Utilites
import { AnonymousError } from 'core/utilites/errors';
import { jwtTokenName } from 'features/shared/auth/auth.constants';

export default function blockRequestWithToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtTokenName);

  if (token)
    throw new AnonymousError(
      'Client passed token to an endpoint that cannot execute with token',
      req.t('error.bad_request'),
      401
    );

  next();
}

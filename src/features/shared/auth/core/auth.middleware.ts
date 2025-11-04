import type { Request, Response, NextFunction } from 'express';

// Utilites
import { AnonymousError } from 'core/utilities/errors';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';

export default function blockRequestWithToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtAccessTokenName);

  if (token)
    throw new AnonymousError(
      'Client passed token to an endpoint that cannot execute with token',
      req.t('error.bad_request'),
      400
    );

  next();
}

import type { Request, Response, NextFunction } from 'express';

// Utilites
import { jwtTokenName } from 'utilites/configs';
import { AnonymousError } from 'utilites/errors';

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

// ---  Extract Placeholders ---

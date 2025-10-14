import type { Request, Response, NextFunction } from 'express';

// Utilites
import { jwtTokenName } from 'utilites/configs';
import { BadRequestError } from 'utilites/errors';

export default function blockRequestWithToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header(jwtTokenName);

  if (token) throw new BadRequestError(req.t('error.bad_request'));

  next();
}

// ---  Extract Placeholders ---

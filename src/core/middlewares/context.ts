import { Request, Response, NextFunction } from 'express';
import { runWithContext } from 'core/utilites/request-context';

export const context = (req: Request, res: Response, next: NextFunction) => {
  runWithContext({ user: req.user, i18n: req.i18n, t: req.t }, next);
};

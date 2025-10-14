import { Request, Response, NextFunction } from 'express';
import { runWithContext } from 'utilites/request-context';

export const context = (req: Request, res: Response, next: NextFunction) => {
  runWithContext(
    {
      user: req.user,
      t: req.t,
      i18n: req.i18n,
    },
    () => next()
  );
};

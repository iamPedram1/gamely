import sendResponse from 'core/utilites/response';
import type { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, 404, {
    body: { message: req.t('error.invalid_route', { url: req.url }) },
  });
};

export default notFound;

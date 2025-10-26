import { decodeHtmlEntities } from 'core/utilities/helperPack';
import sendResponse from 'core/utilities/response';
import type { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, 404, {
    body: {
      message: req.t('error.invalid_route', {
        url: decodeHtmlEntities(req.url),
      }),
    },
  });
};

export default notFound;

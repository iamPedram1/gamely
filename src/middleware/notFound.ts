import sendResponse from 'utilites/response';
import type { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, 404, {
    body: { message: `The requested path '${req.url}' could not be found.` },
  });
};

export default notFound;

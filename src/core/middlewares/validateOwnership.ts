import { Model, RootFilterQuery } from 'mongoose';
import { NotFoundError, ValidationError } from 'core/utilities/errors';

// Types
import type { Request, Response, NextFunction } from 'express';

export default function validateDocumentOwnership<T>(
  Model: Model<T>,
  fieldKey: string,
  modelKey: 'creator' | keyof T,
  type: 'params' | 'body'
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const value = req?.[type]?.[fieldKey];

    if (!value)
      throw new ValidationError(req.t('common.internal_server_error'));

    const count = await Model.exists({
      [modelKey]: req.user.id,
    } as RootFilterQuery<T>);

    if (!count) throw new NotFoundError(req.t('error.forbidden_error'));

    next();
  };
}

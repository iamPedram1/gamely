import { TranslationKeys } from 'core/types/i18n';
import { NotFoundError, ValidationError } from 'core/utilities/errors';
import { Request, Response, NextFunction } from 'express';
import { isValidObjectId, Model } from 'mongoose';

interface ValidateParamConfigs {
  type?: 'id' | 'idArray' | 'string' | 'stringArray';
}

/**
 * Middleware to validate a route param exists in DB.
 */
export function validateParam<T>(
  Model: Model<T>,
  paramKey: string,
  modelKey: keyof T,
  { type = 'string' }: ValidateParamConfigs = {}
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.params[paramKey];

    if (!raw)
      throw new ValidationError(
        req.t('error.param.required', { param: paramKey })
      );

    // normalize to array if array type or comma-separated
    const values =
      type.includes('Array') && typeof raw === 'string'
        ? raw
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : Array.isArray(raw)
          ? raw
          : [raw];

    // validate ObjectId if type is id
    if (type.includes('id') && values.some((v) => !isValidObjectId(v)))
      throw new ValidationError(req.t('error.id_invalid'));

    // check existence in DB
    if (type.includes('Array')) {
      const count = await Model.countDocuments({
        [modelKey]: { $in: values },
      } as any);
      if (count !== values.length)
        throw new NotFoundError(req.t('error.id_invalid'));
    } else {
      const exists = await Model.exists({ [modelKey]: values[0] } as any);
      if (!exists)
        throw new NotFoundError(
          req.t('error.param.not_found', {
            param: paramKey,
            value: raw,
            model: req.t(
              `models.${Model.modelName}.singular` as TranslationKeys
            ),
          })
        );
    }

    next();
  };
}

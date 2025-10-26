import { t } from 'core/utilities/request-context';
import { ValidationError } from 'core/utilities/errors';
import type { Model } from 'mongoose';
import type { TranslationKeys } from 'core/types/i18n';
import type { Request, Response, NextFunction } from 'express';

/**
 * Express middleware factory to ensure a field value is unique in a Mongoose collection.
 *
 * @template T - Mongoose document type
 * @param model - Mongoose model to check
 * @param fieldName - Name of the field to enforce uniqueness (e.g., 'slug', 'email')
 * @param bodyFieldKey - Optional: key in req.body that holds the value (defaults to fieldName)
 * @param paramIdKey - Optional: key in req.params for the current document ID (defaults to 'id')
 */
export default function validateUniqueConflict<T>(
  model: Model<T>,
  fieldName: string,
  bodyFieldKey: string = fieldName,
  paramIdKey = 'id'
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const value = req.body?.[bodyFieldKey];
      if (value === undefined || value === null) return next();

      const excludeId = req.params?.[paramIdKey];

      const conflict = await model.exists({
        [fieldName]: value,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      });

      if (conflict) {
        next(
          new ValidationError(
            t('error.uniqueness_error', {
              field: fieldName,
              value,
              name: t(`models.${model.modelName}.singular` as TranslationKeys),
            })
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

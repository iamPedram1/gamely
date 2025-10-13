import type { Request, Response, NextFunction } from 'express';
import type { Model } from 'mongoose';
import { ValidationError } from 'utilites/errors';

type DocumentKeys = keyof Document | '_id' | '__v' | '$locals';

type EntityKeys<T> = Exclude<keyof T, DocumentKeys>;

/**
 * Express middleware factory to ensure a field value is unique in a Mongoose collection.
 *
 * @template T - Mongoose document type
 * @param model - Mongoose model to check
 * @param fieldName - Name of the field to enforce uniqueness (e.g., 'slug', 'email')
 * @param bodyFieldKey - Optional: key in req.body that holds the value (defaults to fieldName)
 * @param paramIdKey - Optional: key in req.params for the current document ID (defaults to 'id')
 */
export default function validateUniqueConflict<T extends Document>(
  model: Model<T>,
  fieldName: EntityKeys<T> & string,
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
            `${String(fieldName)} '${value}' is already taken by another ${model.modelName.toLowerCase()}.`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

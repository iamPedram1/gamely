import type { Request, Response, NextFunction } from 'express';
import type { Model } from 'mongoose';
import { ValidationError } from 'utilites/errors';

/**
 * Middleware factory to check for uniqueness conflicts on a specified field in a MongoDB collection.
 *
 * It checks if a document with the same field value exists, excluding the current document by ID (if provided).
 * If a conflict is found, it passes a ValidationError to the next error handler.
 *
 * @param Model - Mongoose model to query against
 * @param fieldName - The field name in the document to check uniqueness for (e.g. 'slug', 'email')
 * @param bodyFieldKey - Optional key name in `req.body` that holds the value to check; defaults to `fieldName`
 * @param paramIdKey - Optional key name in `req.params` that holds the current document's ID to exclude; defaults to 'id'
 *
 * @returns Express middleware function (req, res, next) => void
 */
export default function validateUniqueConflict(
  Model: Model<any>,
  fieldName: string,
  bodyFieldKey = fieldName,
  paramIdKey = 'id'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = req.body?.[bodyFieldKey];
      const excludeId = req.params?.[paramIdKey];

      if (!value) return next();

      const conflict = await Model.findOne({
        [fieldName]: value,
        _id: { $ne: excludeId },
      })
        .lean()
        .exec();

      if (conflict) {
        return next(
          new ValidationError(
            `Conflict: ${fieldName} '${value}' is already taken.`
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

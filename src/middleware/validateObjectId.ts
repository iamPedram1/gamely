import type { Request, Response, NextFunction } from 'express';
import { isValidObjectId, Model } from 'mongoose';
import { NotFoundError, ValidationError } from 'utilites/errors';

/**
 * Middleware factory to validate the `id` parameter in the request URL.
 *
 * This middleware checks:
 * - That the `id` parameter exists in `req.params`.
 * - That the `id` is a valid MongoDB ObjectId.
 * - That a document with the given `id` exists in the specified Mongoose model.
 *
 * If any of these checks fail, it throws a `ValidationError`.
 *
 * @template T - The type of the Mongoose document
 * @param Model - Mongoose model to check existence against
 * @returns Express middleware function (req, res, next) => void
 *
 * @throws ValidationError if:
 * - `id` param is missing
 * - `id` is not a valid ObjectId
 * - No document exists with the given `id`
 */
export default function validateObjectId<T>(Model: Model<T>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    if (!id) throw new ValidationError('The id paramater is required');

    if (!isValidObjectId(id)) throw new ValidationError('Invalid id format');

    const count = await Model.countDocuments({ _id: id });
    if (count === 0)
      throw new NotFoundError(
        `No ${Model.modelName.toLowerCase()} with given id was found`
      );

    next();
  };
}

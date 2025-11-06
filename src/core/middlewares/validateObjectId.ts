import { isValidObjectId, Model } from 'mongoose';
import { NotFoundError, ValidationError } from 'core/utilities/errors';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { TranslationKeys } from 'core/types/i18n';

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

    if (!id) throw new ValidationError(req.t('error.id_required'));

    if (!isValidObjectId(id))
      throw new NotFoundError(
        req.t('error.id_invalid', {
          keyname: req.t(
            `models.${Model.modelName}.singular` as TranslationKeys
          ),
        })
      );

    const count = await Model.exists({ _id: id });
    if (!count)
      throw new NotFoundError(
        req.t('error.not_found_by_id', {
          id,
          model: req.t(`models.${Model.modelName}.singular` as TranslationKeys),
        })
      );

    next();
  };
}

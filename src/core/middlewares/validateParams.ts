import { TranslationKeys } from 'core/types/i18n';
import { NotFoundError, ValidationError } from 'core/utilities/errors';
import { Request, Response, NextFunction } from 'express';
import { isValidObjectId, Model } from 'mongoose';

interface ValidateParamConfigs {
  isId?: boolean;
}

export interface ParamValidation<T> {
  model: Model<T>;
  paramKey: string; // name in route params
  modelKey: keyof T; // key in the model to check
  options?: { isId?: boolean };
}

/**
 * Middleware to validate a single param
 */
export function validateParamz<T>(options: ParamValidation<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { model, paramKey, modelKey, options: opts } = options;
    const value = req.params[paramKey];

    if (!value) {
      throw new ValidationError(
        req.t('error.param.required', { param: paramKey })
      );
    }

    // Optionally, you could validate ID format here if opts.isId is true

    const exists = await model.exists({ [modelKey]: value } as any);

    if (!exists) {
      const modelName = req.t(
        `models.${model.modelName}.singular` as TranslationKeys
      );
      throw new NotFoundError(
        req.t('error.param.not_found', {
          value,
          param: paramKey,
          model: modelName,
        })
      );
    }

    next();
  };
}

/**
 * Middleware to validate a route param against a model field
 *
 * @param Model - Mongoose model
 * @param paramKey - Route param name
 * @param modelKey - Field in the model to check against
 *
 * @example
 * router.get('/posts/:id', validateParam(Post, 'id', '_id'), handler);
 * router.get('/comments/:postId', validateParam(Comment, 'postId', 'postId'), handler);
 */
export function validateParam<T>(
  Model: Model<T>,
  paramKey: string,
  modelKey: keyof T,
  configs?: ValidateParamConfigs
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramKey];
    console.log('validateParam', paramKey, modelKey, configs);

    if (configs?.isId) {
      if (!value) throw new ValidationError(req.t('error.id_required'));

      if (!isValidObjectId(value))
        throw new ValidationError(req.t('error.id_invalid'));
    }

    if (!value) {
      throw new ValidationError(
        req.t('error.param.required', { param: paramKey })
      );
    }

    const exists = await Model.exists({ [modelKey]: value } as any);

    if (!exists) {
      const modelName = req.t(
        `models.${Model.modelName}.singular` as TranslationKeys
      );

      throw new NotFoundError(
        req.t('error.param.not_found', {
          param: paramKey,
          value,
          model: modelName,
        })
      );
    }

    next();
  };
}

export function validateParams<T extends ParamValidation<any>[]>(
  validations: readonly [...T]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const v of validations) {
      await validateParamz(v)(req, res, () => Promise.resolve());
    }
    next();
  };
}

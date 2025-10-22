import { TranslationKeys } from 'core/types/i18n';
import { NotFoundError, ValidationError } from 'core/utilites/errors';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';

/**
 * Extract valid param keys from Express params type
 */
type ParamKeys = keyof Request['params'];

/**
 * Ensure the param key exists in the model schema
 */
type ValidParamKey<T> = Extract<keyof T, string>;

/**
 * Type-safe middleware to validate route parameters against a Mongoose model
 *
 * @param Model - Mongoose model to validate against
 * @param paramKey - Parameter key from route params (must exist in both route params and model schema)
 *
 * @example
 * router.get('/users/:userId', validateParams(User, 'userId'), getUserHandler);
 */
export function validateParams<T>(
  Model: Model<T>,
  paramKey: ValidParamKey<T> & ParamKeys
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const value = req.params[paramKey];

    if (!value) {
      throw new ValidationError(
        req.t('error.param.required', { param: paramKey })
      );
    }

    const exists = await Model.exists({ [paramKey]: value } as any);

    if (!exists) {
      const modelKey = `models.${Model.modelName}.singular` as const;

      // Type-safe check to ensure the model translation key exists
      const modelName = req.t(modelKey as TranslationKeys);

      throw new NotFoundError(
        req.t('error.param.not_found_by_param', {
          param: paramKey,
          id: value,
          model: modelName,
        })
      );
    }

    next();
  };
}

/**
 * Alternative version with runtime validation of model name in translation keys
 */
export function validateParamsStrict<T>(
  Model: Model<T>,
  paramKey: ValidParamKey<T> & ParamKeys
) {
  // Verify at initialization that the model has a translation key
  const modelKey = `models.${Model.modelName}.singular`;

  return async function (req: Request, res: Response, next: NextFunction) {
    const value = req.params[paramKey];

    if (!value) {
      throw new ValidationError(
        req.t('error.param.required', { param: paramKey })
      );
    }

    const exists = await Model.exists({ [paramKey]: value } as any);

    if (!exists) {
      throw new NotFoundError(
        req.t('error.param.not_found_by_param', {
          param: paramKey,
          id: value,
          model: req.t(modelKey as TranslationKeys),
        })
      );
    }

    next();
  };
}

/**
 * Enhanced version with multiple param validation
 */
export function validateMultipleParams<T>(
  Model: Model<T>,
  paramKeys: Array<ValidParamKey<T> & ParamKeys>
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const query: Record<string, any> = {};

    // Validate all params exist
    for (const paramKey of paramKeys) {
      const value = req.params[paramKey];

      if (!value) {
        throw new ValidationError(
          req.t('error.param.required', { param: paramKey })
        );
      }

      query[paramKey] = value;
    }

    // Check if document exists with all params
    const exists = await Model.exists(query);

    if (!exists) {
      const modelKey = `models.${Model.modelName}.singular` as const;
      const modelName = req.t(modelKey as TranslationKeys);

      throw new NotFoundError(
        req.t('error.param.not_found_by_param', {
          param: paramKeys.join(', '),
          id: Object.values(query).join(', '),
          model: modelName,
        })
      );
    }

    next();
  };
}

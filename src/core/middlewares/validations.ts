import { TranslationKeys } from 'core/types/i18n';
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from 'core/utilities/errors';
import { Request, Response, NextFunction } from 'express';
import { isValidObjectId, Model } from 'mongoose';

type ErrorNameType = 'NotFoundError' | 'ValidationError' | 'BadRequestError';
interface ValidateConfigs {
  type?: 'id' | 'idArray' | 'string' | 'stringArray';
  required?: boolean;
  error?: ErrorNameType;
}

const getErrorClass = (name: ErrorNameType) => {
  switch (name) {
    case 'BadRequestError':
      return BadRequestError;

    case 'ValidationError':
      return ValidationError;

    case 'NotFoundError':
      return NotFoundError;

    default:
      return Error;
  }
};

/**
 * Middleware to validate a route parameter (`req.params`) and optionally check its existence in the database.
 *
 * Supports single values or arrays, and validates ObjectIds if needed.
 *
 * @template T - The Mongoose model type.
 * @param {Model<T>} Model - The Mongoose model to check existence against.
 * @param {string} paramKey - The key name of the parameter in the route.
 * @param {keyof T} modelKey - The corresponding key in the database model to check existence.
 * @param {Object} [options] - Optional configuration for validation.
 * @param {'id' | 'idArray' | 'string' | 'stringArray'} [options.type='string'] - Type of the parameter. Determines ObjectId validation and array handling.
 *
 * @throws {ValidationError} If the parameter is missing or contains invalid ObjectIds.
 * @throws {NotFoundError} If the value(s) do not exist in the database.
 */
export function validateParam<T>(
  Model: Model<T>,
  paramKey: string,
  modelKey: keyof T,
  { error = 'NotFoundError', required, type = 'string' }: ValidateConfigs = {}
) {
  const ErrorClass = getErrorClass(error);

  return async (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.params[paramKey];

    if (!raw && required)
      throw new ErrorClass(req.t('error.param.required', { param: paramKey }));

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
      throw new ErrorClass(
        req.t('error.id_invalid', {
          keyname: req.t(
            `models.${Model.modelName}.singular` as TranslationKeys
          ),
        })
      );

    // check existence in DB
    if (type.includes('Array')) {
      const count = await Model.countDocuments({
        [modelKey]: { $in: values },
      } as any);
      if (count !== values.length)
        throw new ErrorClass(
          req.t('error.id_invalid', {
            keyname: req.t(
              `models.${Model.modelName}.singular` as TranslationKeys
            ),
          })
        );
    } else {
      const exists = await Model.exists({ [modelKey]: values[0] } as any);
      if (!exists)
        throw new ErrorClass(
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

/**
 * Middleware to validate a request field (from params, body, or query) and optionally check its existence in the database.
 *
 * Supports single values or arrays, and validates ObjectIds if needed.
 * @param {Model<T>} Model - The Mongoose model to check existence against.
 * @param {'params' | 'body' | 'query'} source - Where to read the value from in the request.
 * @param {string} fieldName - The key name of the field in the request.
 * @param {keyof T} modelKey - The corresponding key in the database model to check existence.
 * @param {Object} [options] - Optional configuration for validation.
 * @param {'id' | 'idArray' | 'string' | 'stringArray'} [options.type='string'] - Type of the field. Determines ObjectId validation and array handling.
 *
 * @throws {ValidationError} If the field is missing or contains invalid ObjectIds.
 * @throws {NotFoundError} If the value(s) do not exist in the database.
 */
export function validateRequestField<T>(
  Model: Model<T>,
  source: 'params' | 'body' | 'query',
  fieldName: string,
  modelKey: keyof T,
  { error = 'NotFoundError', required, type = 'string' }: ValidateConfigs = {}
) {
  const ErrorClass = getErrorClass(error);

  return async (req: Request, _res: Response, next: NextFunction) => {
    const rawValue = req[source][fieldName];

    if (!rawValue) {
      if (required)
        throw new ErrorClass(
          req.t('error.param.required', { param: fieldName })
        );
      else return next();
    }

    // Normalize value to array if needed
    const values: string[] = type.endsWith('Array')
      ? (typeof rawValue === 'string'
          ? rawValue.split(',')
          : Array.isArray(rawValue)
            ? rawValue
            : [rawValue]
        )
          .map((v) => v.trim())
          .filter(Boolean)
      : [rawValue];

    // Validate ObjectId if type is id
    if (type.startsWith('id') && values.some((v) => !isValidObjectId(v))) {
      throw new ErrorClass(
        req.t('error.id_invalid', {
          keyname: req.t(
            `models.${Model.modelName}.singular` as TranslationKeys
          ),
        })
      );
    }

    // Check existence in DB
    if (type.endsWith('Array')) {
      const count = await Model.countDocuments({
        [modelKey]: { $in: values },
      } as any);
      if (count !== values.length)
        throw new ErrorClass(
          req.t('error.id_invalid', {
            keyname: req.t(
              `models.${Model.modelName}.singular` as TranslationKeys
            ),
          })
        );
    } else {
      const exists = await Model.exists({ [modelKey]: values[0] } as any);
      if (!exists) {
        throw new ErrorClass(
          req.t('error.param.not_found', {
            param: fieldName,
            value: rawValue,
            model: req.t(
              `models.${Model.modelName}.singular` as TranslationKeys
            ),
          })
        );
      }
    }

    next();
  };
}

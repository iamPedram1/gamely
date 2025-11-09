import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import type { Request, Response, NextFunction } from 'express';

// Utilities
import { ValidationError } from 'core/utilities/errors';
import {
  flattenValidationErrors,
  formatValidationErrors,
} from 'core/utilities/helperPack';

/**
 * Middleware factory to validate the request body against a DTO class using class-validator.
 *
 * It transforms the plain `req.body` object into an instance of the specified DTO class,
 * then runs validation rules defined in the DTO. If validation errors exist,
 * it throws a `ValidationError`.
 *
 * @template T - The type of the DTO class
 * @param DtoClass - The class constructor of the DTO to validate against
 * @returns Express middleware function (req, res, next) => void
 *
 * @throws ValidationError if validation fails
 */
export default function validateBody<T>(DtoClass: ClassConstructor<T>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    console.log(req.baseUrl, DtoClass, req.body, req.params, req.query);

    const dto = plainToInstance(DtoClass, req.body || {}, {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
      enableCircularCheck: true,
    });

    const errors = await validate(dto as object, {
      whitelist: true,
      skipMissingProperties: false,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new ValidationError(req.t('error.validation_failed'), {
        cause: flattenValidationErrors(errors),
        errorDetails: formatValidationErrors(errors),
      });
    }

    Object.defineProperty(req, 'body', {
      ...Object.getOwnPropertyDescriptor(req, 'body'),
      writable: false,
      value: dto,
    });

    next();
  };
}

import {
  ValidationError as CVValidationError,
  validate,
} from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import type { Request, Response, NextFunction } from 'express';
// Utilities
import { ValidationError } from 'core/utilities/errors';

export function validateQuery<T>(DtoClass: ClassConstructor<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToInstance(DtoClass, req.query, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dto as object, { whitelist: true });

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints || {})
      );
      throw new ValidationError(req.t('error.validation_failed'), {
        cause: messages,
      });
    }

    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      writable: false,
      value: dto,
    });

    next();
  };
}

export function softValidateQuery<T extends Record<any, any>>(
  DtoClass: ClassConstructor<T>
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Convert query to DTO instance
    console.log(req.query);
    const dto = plainToInstance(DtoClass, req.query, {
      enableImplicitConversion: true,
    });

    // Validate without throwing
    const errors: CVValidationError[] = await validate(dto, {
      whitelist: true, // removes unknown keys
      forbidNonWhitelisted: false,
      skipMissingProperties: true, // skip undefined fields
    });

    // Remove invalid properties from the DTO instance
    errors.forEach((err) => {
      delete (dto as any)[err.property];
    });

    // Replace req.query with cleaned DTO
    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      writable: false,
      value: dto,
    });

    next();
  };
}

import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import type { Request, Response, NextFunction } from 'express';

// Utilities
import { ValidationError } from 'core/utilites/errors';

export default function validateQuery<T>(DtoClass: ClassConstructor<T>) {
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

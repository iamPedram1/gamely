import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import type { Request, Response, NextFunction } from 'express';

import { ValidationError } from 'utilites/errors';

export default function validateBody<T>(DtoClass: ClassConstructor<T>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto as object);
    if (errors.length > 0) throw new ValidationError('Validation failed.');
    next();
  };
}

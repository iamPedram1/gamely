import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import mongoose from 'mongoose';
import { ValidationError } from 'utilites/errors';

export class BaseValidation {
  constructor() {}

  validateObjectId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ObjectId');
    }
  }

  validateData(data: any, dto: any) {
    return validateOrReject(dto(data));
  }
}

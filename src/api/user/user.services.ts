import bcryptjs from 'bcryptjs';
import validator from 'class-validator';

import UserModel, { UserDocument } from 'api/user/user.model';
import { ValidationError } from 'utilites/errors';
import type { IUserProps } from 'api/user/user.types';

export interface IUserService {
  validate: (data: IUserProps) => Promise<validator.ValidationError[]>;
  comparePassword: (password: string, hash: string) => Promise<void>;
  hashPassword: (password: string) => Promise<string>;
  create: (data: IUserProps) => Promise<UserDocument>;
  getUserByEmail: (email: string) => Promise<UserDocument | null>;
  checkEmailExist: (
    email: string,
    callbackFn?: (exist: boolean) => void
  ) => Promise<boolean>;
}

export default class UserService implements IUserService {
  async validate(data: IUserProps) {
    const result = await validator.validate(data);
    if (result.length > 0) throw new ValidationError('User validation failed.');
    return result;
  }

  async comparePassword(password: string, hash: string) {
    const isPasswordCorrect = await bcryptjs.compare(password, hash);
    if (!isPasswordCorrect)
      throw new ValidationError('Email or password is incorrect.');
  }

  async hashPassword(password: string) {
    const salt = await bcryptjs.genSalt();
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  }

  async create(data: IUserProps): Promise<UserDocument> {
    const user = new UserModel(data);

    await user.save();

    return user;
  }

  async checkEmailExist(
    email: string,
    callback?: (exist: boolean) => void
  ): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    if (callback) callback(count > 0);
    return count > 0;
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return await UserModel.findOne({ email });
  }
}

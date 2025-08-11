import bcryptjs from 'bcryptjs';

import UserModel, { UserDocument } from 'api/user/user.model';
import { ValidationError } from 'utilites/errors';
import type { IUserProps } from 'api/user/user.types';

export interface IUserService {
  login: (data: Pick<IUserProps, 'email' | 'password'>) => Promise<string>;
  register: (data: IUserProps) => Promise<string>;
  comparePassword: (password: string, hash: string) => Promise<void>;
  hashPassword: (password: string) => Promise<string>;
  create: (data: IUserProps) => Promise<UserDocument>;
  getUserByEmail: (email: string) => Promise<UserDocument | null>;
  getUserById: (_id: string) => Promise<UserDocument | null>;
}

export default class UserService implements IUserService {
  async register(data: IUserProps): Promise<string> {
    const user = await this.getUserByEmail(data.email);
    if (user)
      throw new ValidationError('A user with the given email already exist.');

    data.password = await this.hashPassword(data.password);

    return (await this.create(data)).generateAuthToken();
  }

  async login(data: Pick<IUserProps, 'email' | 'password'>) {
    const message = 'Email or password is incorrect.';

    const user = await this.getUserByEmail(data.email, true);

    if (!user) throw new ValidationError(message);

    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect) throw new ValidationError(message);

    return user.generateAuthToken();
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

  async getUserByEmail(
    email: string,
    selectPassword?: boolean
  ): Promise<UserDocument | null> {
    return selectPassword
      ? await UserModel.findOne({ email }).select('+password').exec()
      : await UserModel.findOne({ email }).exec();
  }

  async getUserById(_id: string): Promise<UserDocument | null> {
    return await UserModel.findOne({ _id });
  }

  async emailExist(email: string): Promise<boolean> {
    return (await UserModel.countDocuments({ email })) > 0;
  }
}

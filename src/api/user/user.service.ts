import bcryptjs from 'bcryptjs';

import UserModel, { UserDocument } from 'api/user/user.model';
import { ValidationError } from 'utilites/errors';
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

export type IUserService = InstanceType<typeof UserService>;

export default class UserService implements IUserService {
  async register(data: RegisterDto): Promise<string> {
    const user = await this.getUserByEmail(data.email);
    if (user)
      throw new ValidationError('A user with the given email already exist.');

    data.password = await this.hashPassword(data.password);

    return (await this.create({ ...data })).generateAuthToken();
  }

  async login(data: LoginDto) {
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

  async create(data: RegisterDto): Promise<UserDocument> {
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

  async getUsers(): Promise<UserDocument[]> {
    return await UserModel.find();
  }

  async emailExist(email: string): Promise<boolean> {
    return Boolean(await UserModel.exists({ email }));
  }
}

import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { injectable } from 'tsyringe';

// Model
import User, { IRefreshToken } from 'api/user/user.model';

// Service
import BaseService from 'services/base.service.module';

// Utilities
import { AnonymousError, ValidationError } from 'utilites/errors';

// Dto
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

// Types
import { UserDocument } from 'api/user/user.model';
import { UpdateProfileDto } from 'api/user/user.dto';
import { IUserEntity } from 'api/user/user.types';
import { jwtRefreshTokenKey } from 'utilites/configs';

type AuthTokens = Pick<IUserEntity, 'refreshToken' | 'token'>;

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<
  IUserEntity,
  RegisterDto & Partial<AuthTokens>,
  UpdateProfileDto & Partial<AuthTokens>,
  UserDocument
> {
  constructor() {
    super(User);
  }

  async register(data: RegisterDto): Promise<IUserEntity> {
    const user = await this.existsByKey('email', data.email);

    if (user) throw new ValidationError(this.t('messages.auth.email_exists'));

    data.password = await this.hashPassword(data.password);

    return await this.create({ ...data });
  }

  async update(userId: string, data: UpdateProfileDto): Promise<IUserEntity> {
    const user = await this.updateOneById(
      userId,
      {
        ...data,
        ...(data.password && {
          password: await this.hashPassword(data.password),
        }),
      },
      { lean: true }
    );

    return user;
  }

  async login(data: LoginDto) {
    const user = await this.getOneByKey('email', data.email.toLowerCase(), {
      select: '+password',
      throwError: false,
    });

    const mask = 'Email or password is incorrect';

    if (!user) throw new AnonymousError('User not found', mask);

    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect) throw new Error();

    const { token, refreshToken } = user.generateAuthToken();

    user.set('token', token);
    user.set('refreshToken', refreshToken);

    const res = await user.save();
    if (!res)
      throw new AnonymousError('Error occured while saving tokens', mask);

    return { token, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const { userId } = jwt.verify(
      refreshToken,
      jwtRefreshTokenKey
    ) as IRefreshToken;
    const user = await this.getOneById(userId, { select: '+refreshToken' });

    if (user.refreshToken !== refreshToken)
      throw new ValidationError(this.t('error.refresh_token_invalid'));

    const newAuth = user.generateAuthToken();

    user.set('token', newAuth.token);
    user.set('refreshToken', newAuth.refreshToken);

    const res = await user.save();

    if (!res)
      throw new AnonymousError('An error occured while generating token');

    return newAuth;
  }

  async clearToken(userId: string) {
    const user = await this.getOneById(userId);
    user.set('token', null);
    user.set('refreshToken', null);

    const res = await user.save();

    if (!res)
      throw new AnonymousError('An error occured while cleaning up token');

    return true;
  }

  async comparePassword(password: string, hash: string) {
    return await bcryptjs.compare(password, hash);
  }

  async hashPassword(password: string) {
    const salt = await bcryptjs.genSalt();
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  }
}

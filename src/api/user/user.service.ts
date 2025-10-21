import { injectable } from 'tsyringe';

// Model
import User from 'api/user/user.model';

// Service
import BaseService from 'core/services/base/base.service';

// Utilities
import crypto from 'core/utilites/crypto';

// Types
import { UserDocument } from 'api/user/user.model';
import { UpdateProfileDto } from 'api/user/user.dto';
import { IUserEntity } from 'api/user/user.types';
import { RegisterDto } from 'api/auth/auth.dto';
import { ClientSession } from 'mongoose';

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<
  IUserEntity,
  RegisterDto,
  UpdateProfileDto,
  UserDocument
> {
  constructor() {
    super(User);
  }

  async mutateWithTransaction<T>(fn: (session: ClientSession) => Promise<T>) {
    return this.withTransaction(fn);
  }

  async update(userId: string, data: UpdateProfileDto): Promise<IUserEntity> {
    const user = await this.updateOneById(userId, data, { lean: true });

    return user;
  }
}

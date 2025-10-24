import { injectable } from 'tsyringe';
import type { ClientSession } from 'mongoose';

// Model
import User from 'api/user/user.model';

// Service
import BaseService from 'core/services/base/base.service';

// Dto
import { UpdateProfileDto } from 'api/user/user.dto';
import { RegisterDto } from 'features/shared/auth/auth.dto';

// Types
import { UserDocument } from 'api/user/user.model';
import { IUserEntity } from 'api/user/user.types';

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

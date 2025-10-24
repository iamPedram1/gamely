import { injectable } from 'tsyringe';
import type { ClientSession } from 'mongoose';

// Model
import User from 'features/shared/user/user.model';

// Service
import BaseService from 'core/services/base/base.service';

// DTO
import { RegisterDto } from 'features/shared/auth/auth.dto';
import { UpdateProfileDto } from 'features/client/user/user.client.dto';

// Types
import type { IUserEntity } from 'features/shared/user/user.types';
import type { UserDocument } from 'features/shared/user/user.model';
import { ForbiddenError } from 'core/utilites/errors';
import { UpdateUserDto } from 'features/management/user/user.management.dto';

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<
  IUserEntity,
  RegisterDto,
  UpdateUserDto | UpdateProfileDto,
  UserDocument
> {
  constructor() {
    super(User);
  }

  async mutateWithTransaction<T>(fn: (session: ClientSession) => Promise<T>) {
    return this.withTransaction(fn);
  }

  async update(
    userId: string,
    data: UpdateUserDto | UpdateProfileDto
  ): Promise<IUserEntity> {
    const isUpdatingSelf = this.currentUser.id === userId;

    if (this.currentUser.isNot('admin') && !isUpdatingSelf)
      throw new ForbiddenError();

    return await this.updateOneById(userId, data, { lean: true });
  }
}

import { injectable } from 'tsyringe';
import type { ClientSession } from 'mongoose';

// Model
import User from 'features/shared/user/user.model';

// Service
import BaseService from 'core/services/base/base.service';

// DTO
import { RegisterDto } from 'features/shared/auth/auth.dto';
import { UpdateProfileDto } from 'features/client/user/user.client.dto';
import { UpdateUserDto } from 'features/management/user/user.management.dto';

// Types
import type { IUserEntity } from 'features/shared/user/user.types';
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/user.model';
import {
  BadRequestError,
  ForbiddenError,
  ValidationError,
} from 'core/utilites/errors';

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
    const user = await this.getOneById(userId, { lean: true });
    const isUpdatingSelf = this.currentUser.id === userId;
    const isUpdatingRole = 'role' in data && data.role && data.role.length > 0;
    const isBlocking = 'status' in data && data.status === 'blocked';

    if (isBlocking && this.currentUser.is(['admin', 'superAdmin']))
      this.validateBlocking(user, isUpdatingSelf);

    if (isUpdatingRole && this.currentUser.is(['admin', 'superAdmin']))
      this.validateUpdatingRole();

    if (this.currentUser.isNot(['admin', 'superAdmin']) && !isUpdatingSelf)
      throw new ForbiddenError();

    return await this.updateOneById(userId, data, { lean: true });
  }

  private validateBlocking(
    targetUser: UserLeanDocument,
    isUpdatingSelf: boolean
  ) {
    const targetIsAdmin =
      targetUser.role === 'admin' || targetUser.role === 'superAdmin';

    if (isUpdatingSelf)
      throw new BadRequestError(this.t('error.user.self_block'));

    if (this.currentUser.is('admin') && targetIsAdmin)
      throw new ValidationError(this.t('error.user.forbidden_block'));
  }

  private validateUpdatingRole() {
    if (this.currentUser.isNot('superAdmin'))
      throw new ValidationError(this.t('error.user.update_role'));
  }
}

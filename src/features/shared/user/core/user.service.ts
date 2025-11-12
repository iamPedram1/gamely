import { delay, inject, injectable } from 'tsyringe';
import type { Types } from 'mongoose';

// Model
import User from 'features/shared/user/core/user.model';

// Service
import BaseService from 'core/services/base/base.service';
import BlockService from 'features/shared/user/block/block.service';
import SessionService from 'features/shared/auth/session/session.service';
import FollowService from 'features/shared/user/follow/follow.service';

// DTO
import { UpdateProfileDto } from 'features/client/user/core/user.client.dto';
import { UpdateUserDto } from 'features/management/user/core/user.management.dto';

// Types
import type { DocumentId } from 'core/types/common';
import type { IUserEntity } from 'features/shared/user/core/user.types';
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/core/user.types';
import {
  BadRequestError,
  ForbiddenError,
  ValidationError,
} from 'core/utilities/errors';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
} from 'core/types/base.service.type';

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<IUserEntity> {
  constructor(
    @inject(delay(() => FollowService))
    private followService: FollowService,
    @inject(delay(() => SessionService))
    private sessionService: SessionService,
    @inject(delay(() => BlockService))
    private blockService: BlockService
  ) {
    super(User);
  }

  async getSelfProfile() {
    const user = await this.getOneById(this.currentUser.id, {
      populate: 'avatar',
      lean: true,
    });

    return { ...user, lastSeen: new Date().toISOString() };
  }

  async getUserProfile(username: string) {
    const user = await this.getOneByKey(
      'username',
      username.trim().toLowerCase(),
      {
        populate: 'avatar',
        select: '-email',
        lean: true,
      }
    );

    const userId = user._id;
    const viewerId = this.softCurrentUser?.id;

    const promises: [
      Promise<string | null>,
      Promise<boolean>?,
      Promise<boolean>?,
    ] = [this.getUserLastSeen(userId)];

    if (viewerId) {
      promises.push(this.followService.checkIsFollowing(viewerId, userId));
      promises.push(this.blockService.checkIsBlock(user._id, viewerId));
    }

    const [lastSeen, isFollowing, viewerBlockedByUser] =
      await Promise.all(promises);

    if (viewerBlockedByUser)
      throw new ValidationError(
        this.t('error.block.have_been_blocked_by_user')
      );

    return { ...user, lastSeen, isFollowing: isFollowing ?? false };
  }

  async update(
    userId: DocumentId,
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

    return await this.withTransaction(async (session) => {
      if (isBlocking)
        await this.sessionService.deleteManyByKey('user', userId, { session });
      return await this.updateOneById(userId, data, { session, lean: true });
    });
  }

  async adjustMetadata(
    userId: DocumentId,
    key: keyof UserDocument,
    value: number,
    options?: BaseMutateOptions
  ) {
    return await this.updateOneById(
      userId,
      { $inc: { [key]: value } },
      options
    );
  }

  async adjustPostCount(
    userId: DocumentId,
    value: number,
    options?: BaseMutateOptions
  ) {
    return this.adjustMetadata(userId, 'postsCount', value, options);
  }

  async adjustFollowersCount(
    userId: DocumentId,
    value: number,
    options?: BaseMutateOptions
  ) {
    return this.adjustMetadata(userId, 'followersCount', value, options);
  }

  async adjustBlocksCount(
    userId: DocumentId,
    value: number,
    options?: BaseMutateOptions
  ) {
    return this.adjustMetadata(userId, 'blocksCount', value, options);
  }

  async adjustFollowingsCount(
    userId: DocumentId,
    value: number,
    options?: BaseMutateOptions
  ) {
    return this.adjustMetadata(userId, 'followingsCount', value, options);
  }

  private async getUserLastSeen(userId: DocumentId) {
    return (
      (
        await this.sessionService.find({
          lean: true,
          filter: { user: userId },
          select: 'lastActivity',
          sort: { lastActivity: -1 },
          paginate: false,
          limit: 1,
        })
      )?.[0]?.lastActivity.toISOString() || null
    );
  }

  async getIdByUsername(username: string) {
    const user = await this.getOneByKey(
      'username',
      username.trim().toLowerCase(),
      { lean: true, select: '_id' }
    );

    return user._id.toHexString();
  }

  async getUserByEmail(
    email: string,
    options?: BaseQueryOptions<UserDocument> & { throwError?: boolean }
  ) {
    return await this.getOneByKey('email', email.trim().toLowerCase(), {
      lean: true,
      ...options,
    });
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
      throw new ForbiddenError(this.t('error.user.forbidden_block'));
  }

  private validateUpdatingRole() {
    if (this.currentUser.isNot('superAdmin'))
      throw new ForbiddenError(this.t('error.user.update_role'));
  }
}

import { delay, inject, injectable } from 'tsyringe';
import type { ClientSession, Types } from 'mongoose';

// Model
import User from 'features/shared/user/user.model';

// Service
import BaseService from 'core/services/base/base.service';

// DTO
import { RegisterDto } from 'features/shared/auth/auth.dto';
import PostService from 'features/shared/post/post.service';
import SessionService from 'features/shared/session/session.service';
import FollowService from 'features/shared/follow/follow.service';
import { UpdateProfileDto } from 'features/client/user/user.client.dto';
import { UpdateUserDto } from 'features/management/user/user.management.dto';

// Types
import type { IUserEntity } from 'features/shared/user/user.types';
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/user.types';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from 'core/utilities/errors';

import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { DocumentId } from 'core/types/common';
import BlockService from 'features/shared/block/block.service';

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<
  IUserEntity,
  RegisterDto,
  UpdateUserDto | UpdateProfileDto,
  UserDocument
> {
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

  async mutateWithTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    exisitingSession?: ClientSession
  ) {
    return this.withTransaction(fn, exisitingSession);
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

    return await this.updateOneById(userId, data, { lean: true });
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
          filter: { userId },
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

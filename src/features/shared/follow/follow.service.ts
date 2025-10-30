import mongoose, { FilterQuery } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import Follow from 'features/shared/follow/follow.model';

// DTO
import { CreateFollowDto } from 'features/shared/follow/follow.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/user.service';
import BlockService from 'features/shared/block/block.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';
import type {
  IFollowEntity,
  FollowDocument,
} from 'features/shared/follow/follow.types';

export type IFollowService = InstanceType<typeof FollowService>;

@injectable()
class FollowService extends BaseService<
  IFollowEntity,
  CreateFollowDto,
  null,
  FollowDocument
> {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => BlockService))
    private blockService: BlockService
  ) {
    super(Follow);
  }

  async follow(
    actorId: string,
    targetId: string,
    options?: BaseMutateOptions
  ): Promise<void> {
    return this.withTransaction(async (session) => {
      if (actorId === targetId)
        throw new ValidationError(this.t('error.follow.follow_self'));

      const [isFollowing, isBlockedByUser] = await Promise.all([
        this.checkIsFollowing(actorId, targetId),
        this.blockService.checkIsBlock(targetId, actorId),
      ]);

      if (isFollowing)
        throw new ValidationError(this.t('error.follow.already_following'));
      if (isBlockedByUser)
        throw new ValidationError(
          this.t('error.block.have_been_blocked_by_user')
        );

      const follow = new CreateFollowDto();
      follow.user = actorId;
      follow.followed = targetId;

      await Promise.all([
        this.create(follow, { session, ...options }),
        this.userService.adjustFollowersCount(targetId, 1, { session }),
        this.userService.adjustFollowingsCount(actorId, 1, { session }),
      ]);
    }, options?.session);
  }

  async unfollow(
    actorId: string,
    targetId: string,
    options?: BaseMutateOptions
  ): Promise<void> {
    return this.withTransaction(async (session) => {
      if (actorId === targetId)
        throw new ValidationError(this.t('error.follow.unfollow_self'));

      const follow = new CreateFollowDto();
      follow.user = actorId;
      follow.followed = targetId;

      const record = await this.getOneByCondition(follow, {
        throwError: false,
      });

      if (!record)
        throw new ValidationError(this.t('error.follow.not_following'));

      await Promise.all([
        record.deleteOne({ session, ...options }),
        this.userService.adjustFollowersCount(targetId, -1, { session }),
        this.userService.adjustFollowingsCount(actorId, -1, { session }),
      ]);
    }, options?.session);
  }

  async getFollowersCount(userId: DocumentId): Promise<number> {
    return await this.countDocuments(
      this.getQueryFilterOf(userId, 'followers')
    );
  }

  async getFollowingsCount(userId: DocumentId): Promise<number> {
    return await this.countDocuments(
      this.getQueryFilterOf(userId, 'followings')
    );
  }

  async getFollowers<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    userId: DocumentId,
    options?:
      | (BaseQueryOptions<IFollowEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<IFollowEntity, FollowDocument, TLean, TPaginate>> {
    const followers = await this.find({
      filter: this.getQueryFilterOf(userId, 'followers'),
      lean: true,
      select: 'createdAt user',
      populate: 'user',
      ...options,
    });

    return followers;
  }

  async getFollowings<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    userId: DocumentId,
    options?:
      | (BaseQueryOptions<IFollowEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<IFollowEntity, FollowDocument, TLean, TPaginate>> {
    return await this.find({
      filter: this.getQueryFilterOf(userId, 'followings'),
      lean: true,
      populate: 'followed',
      ...options,
    });
  }

  async checkIsFollowing(followerId: DocumentId, followingId: DocumentId) {
    if (followerId === followingId) return false;
    return await this.existsByCondition({
      user: { $eq: followerId },
      followed: { $eq: followingId },
    });
  }

  private getQueryFilterOf(
    userId: DocumentId,
    type: 'followers' | 'followings'
  ): FilterQuery<IFollowEntity> {
    return {
      [type === 'followers' ? 'followed' : 'user']: {
        $eq: new mongoose.Types.ObjectId(userId),
      },
    };
  }
}

export default FollowService;

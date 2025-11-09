import mongoose, { FilterQuery } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import Follow from 'features/shared/user/follow/follow.model';

// DTO
import { CreateFollowDto } from 'features/shared/user/follow/follow.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/core/user.service';
import BlockService from 'features/shared/user/block/block.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';
import type { IFollowEntity } from 'features/shared/user/follow/follow.types';

export type IFollowService = InstanceType<typeof FollowService>;

@injectable()
class FollowService extends BaseService<IFollowEntity> {
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
    return await this.withTransaction(async (session) => {
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
      follow.follower = actorId;
      follow.following = targetId;

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
    return await this.withTransaction(async (session) => {
      if (actorId === targetId)
        throw new ValidationError(this.t('error.follow.unfollow_self'));

      const follow = new CreateFollowDto();
      follow.follower = actorId;
      follow.following = targetId;

      const record = await this.getOneByCondition(follow, {
        throwError: false,
      });

      if (!record) return;

      await Promise.all([
        record?.deleteOne({ session, ...options }),
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
  ): Promise<FindResult<IFollowEntity, TLean, TPaginate>> {
    const followers = await this.find({
      filter: this.getQueryFilterOf(userId, 'followers'),
      lean: true,
      select: 'createdAt follower',
      populate: [{ path: 'follower', populate: 'avatar' }],
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
  ): Promise<FindResult<IFollowEntity, TLean, TPaginate>> {
    return await this.find({
      filter: this.getQueryFilterOf(userId, 'followings'),
      lean: true,
      populate: [{ path: 'following', populate: 'avatar' }],
      ...options,
    });
  }

  async checkIsFollowing(followerId: DocumentId, followingId: DocumentId) {
    if (followerId === followingId) return false;
    return await this.existsByCondition({
      follower: { $eq: followerId },
      following: { $eq: followingId },
    });
  }

  private getQueryFilterOf(
    userId: DocumentId,
    type: 'followers' | 'followings'
  ): FilterQuery<IFollowEntity> {
    return {
      [type === 'followers' ? 'following' : 'follower']: {
        $eq: new mongoose.Types.ObjectId(userId),
      },
    };
  }
}

export default FollowService;

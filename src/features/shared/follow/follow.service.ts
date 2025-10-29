import mongoose, { FilterQuery, mongo } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import Follow from 'features/shared/follow/follow.model';

// DTO
import { CreateFollowDto } from 'features/shared/follow/follow.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/user.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type {
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
    private userService: UserService
  ) {
    super(Follow);
  }

  async follow(userIdToFollow: string): Promise<void> {
    return this.withTransaction(async (session) => {
      if (this.currentUser.id === userIdToFollow)
        throw new ValidationError(this.t('error.follow.follow_self'));

      if (await this.checkIsFollowing(this.currentUser.id, userIdToFollow))
        throw new ValidationError(this.t('error.follow.already_following'));

      const follow = new CreateFollowDto();
      follow.user = this.currentUser.id;
      follow.followed = userIdToFollow;

      await Promise.all([
        this.create(follow, { session }),
        this.userService.adjustFollowingsCount(this.currentUser.id, 1, {
          session,
        }),
        this.userService.adjustFollowersCount(userIdToFollow, 1, { session }),
      ]);
    });
  }

  async unfollow(userIdToUnfollow: string): Promise<void> {
    return this.withTransaction(async (session) => {
      if (this.currentUser.id === userIdToUnfollow)
        throw new ValidationError(this.t('error.follow.unfollow_self'));

      const follow = new CreateFollowDto();
      follow.user = this.currentUser.id;
      follow.followed = userIdToUnfollow;

      const record = await this.getOneByCondition(follow, {
        throwError: false,
      });

      if (!record)
        throw new ValidationError(this.t('error.follow.not_following'));

      await Promise.all([
        record.deleteOne({ session }),
        this.userService.adjustFollowingsCount(this.currentUser.id, -1, {
          session,
        }),
        this.userService.adjustFollowersCount(userIdToUnfollow, -1, {
          session,
        }),
      ]);
    });
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

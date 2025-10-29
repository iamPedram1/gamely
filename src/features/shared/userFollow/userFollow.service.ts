import mongoose, { FilterQuery, mongo } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import UserFollow from 'features/shared/userFollow/userFollow.model';

// DTO
import { CreateUserFollowDto } from 'features/shared/userFollow/userFollow.dto';

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
  IUserFollowEntity,
  UserFollowDocument,
} from 'features/shared/userFollow/userFollow.types';

export type IUserFollowService = InstanceType<typeof UserFollowService>;

@injectable()
class UserFollowService extends BaseService<
  IUserFollowEntity,
  CreateUserFollowDto,
  null,
  UserFollowDocument
> {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService
  ) {
    super(UserFollow);
  }

  async follow(userIdToFollow: string): Promise<void> {
    return this.withTransaction(async (session) => {
      if (this.currentUser.id === userIdToFollow)
        throw new ValidationError(this.t('error.userFollow.follow_self'));

      if (await this.checkIsFollowing(this.currentUser.id, userIdToFollow))
        throw new ValidationError(this.t('error.userFollow.already_following'));

      const follow = new CreateUserFollowDto();
      follow.user = this.currentUser.id;
      follow.follows = userIdToFollow;

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
        throw new ValidationError(this.t('error.userFollow.unfollow_self'));

      const follow = new CreateUserFollowDto();
      follow.user = this.currentUser.id;
      follow.follows = userIdToUnfollow;

      const record = await this.getOneByCondition(follow, {
        throwError: false,
      });

      if (!record)
        throw new ValidationError(this.t('error.userFollow.not_following'));

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
      | (BaseQueryOptions<IUserFollowEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<
    FindResult<IUserFollowEntity, UserFollowDocument, TLean, TPaginate>
  > {
    const followers = await this.find({
      filter: { follows: userId },
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
      | (BaseQueryOptions<IUserFollowEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<
    FindResult<IUserFollowEntity, UserFollowDocument, TLean, TPaginate>
  > {
    return await this.find({
      filter: { user: { $eq: userId } },
      lean: true,
      populate: 'follows',
      ...options,
    });
  }

  async checkIsFollowing(followerId: DocumentId, followingId: DocumentId) {
    return await this.existsByCondition({
      user: { $eq: followerId },
      follows: { $eq: followingId },
    });
  }

  private getQueryFilterOf(
    userId: DocumentId,
    type: 'followers' | 'followings'
  ): FilterQuery<IUserFollowEntity> {
    return {
      [type === 'followers' ? 'user' : 'follows']: {
        $eq: new mongoose.Types.ObjectId(userId),
      },
    };
  }
}

export default UserFollowService;

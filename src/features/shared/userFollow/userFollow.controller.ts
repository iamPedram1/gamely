import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'features/shared/user/user.service';
import UserFollowService from 'features/shared/userFollow/userFollow.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { UserFollowMapper } from 'features/shared/userFollow/userFollow.mapper';
import { UserFollowLeanDocument } from 'features/shared/userFollow/userFollow.types';

@injectable()
export default class UserFollowController {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => UserFollowMapper))
    private userFollowMapper: UserFollowMapper,
    @inject(delay(() => UserFollowService))
    private userFollowService: UserFollowService
  ) {}

  follow: RequestHandler = async (req, res) => {
    await this.userFollowService.follow(req.params.userId);

    sendResponse(res, 204);
  };

  unfollow: RequestHandler = async (req, res) => {
    await this.userFollowService.unfollow(req.params.userId);

    sendResponse(res, 204);
  };

  getUserFollowers: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const followers = await this.userFollowService.getFollowers(userId);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.userFollow.followers'),
      body: {
        data: {
          pagination: followers.pagination,
          docs: followers.docs.map((doc) =>
            this.userFollowMapper.toFollowerDto(doc)
          ),
        },
      },
    });
  };

  getUserFollowings: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const followings = await this.userFollowService.getFollowings(userId);

    if (req.user?.id) {
      await Promise.all(
        (
          followings.docs as Array<
            UserFollowLeanDocument & { isFollowing: boolean }
          >
        ).map(async (follower) => {
          follower.isFollowing = await this.userFollowService.checkIsFollowing(
            req.user.id,
            follower.followed._id
          );
        })
      );
    }

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.userFollow.followings'),
      body: {
        data: {
          pagination: followings.pagination,
          docs: followings.docs.map((doc) =>
            this.userFollowMapper.toFollowingDto(doc)
          ),
        },
      },
    });
  };

  getProfileFollowers: RequestHandler = async (req, res) => {
    const followers = await this.userFollowService.getFollowers(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.userFollow.followers'),
      body: {
        data: {
          pagination: followers.pagination,
          docs: followers.docs.map((doc) =>
            this.userFollowMapper.toFollowerDto(doc)
          ),
        },
      },
    });
  };

  getProfileFollowings: RequestHandler = async (req, res) => {
    const followings = await this.userFollowService.getFollowings(req.user.id);

    if (req.user?.id) {
      await Promise.all(
        (
          followings.docs as Array<
            UserFollowLeanDocument & { isFollowing: boolean }
          >
        ).map(async (follower) => {
          follower.isFollowing = await this.userFollowService.checkIsFollowing(
            req.user.id,
            follower.followed._id
          );
        })
      );
    }

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.userFollow.followings'),
      body: {
        data: {
          pagination: followings.pagination,
          docs: followings.docs.map((doc) =>
            this.userFollowMapper.toFollowingDto(doc)
          ),
        },
      },
    });
  };
}

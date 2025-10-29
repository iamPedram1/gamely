import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'features/shared/user/user.service';
import FollowService from 'features/shared/follow/follow.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { FollowMapper } from 'features/shared/follow/follow.mapper';
import { FollowLeanDocument } from 'features/shared/follow/follow.types';

@injectable()
export default class FollowController {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => FollowMapper))
    private followMapper: FollowMapper,
    @inject(delay(() => FollowService))
    private followService: FollowService
  ) {}

  follow: RequestHandler = async (req, res) => {
    await this.followService.follow(req.params.userId);

    sendResponse(res, 204);
  };

  unfollow: RequestHandler = async (req, res) => {
    await this.followService.unfollow(req.params.userId);

    sendResponse(res, 204);
  };

  getFollowers: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const followers = await this.followService.getFollowers(userId);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followers'),
      body: {
        data: {
          pagination: followers.pagination,
          docs: followers.docs.map((doc) =>
            this.followMapper.toFollowerDto(doc)
          ),
        },
      },
    });
  };

  getFollowings: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const followings = await this.followService.getFollowings(userId);

    if (req.user?.id) {
      await Promise.all(
        (
          followings.docs as Array<
            FollowLeanDocument & { isFollowing: boolean }
          >
        ).map(async (follower) => {
          follower.isFollowing = await this.followService.checkIsFollowing(
            req.user.id,
            follower.followed._id
          );
        })
      );
    }

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followings'),
      body: {
        data: {
          pagination: followings.pagination,
          docs: followings.docs.map((doc) =>
            this.followMapper.toFollowingDto(doc)
          ),
        },
      },
    });
  };

  getProfileFollowers: RequestHandler = async (req, res) => {
    const followers = await this.followService.getFollowers(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followers'),
      body: {
        data: {
          pagination: followers.pagination,
          docs: followers.docs.map((doc) =>
            this.followMapper.toFollowerDto(doc)
          ),
        },
      },
    });
  };

  getProfileFollowings: RequestHandler = async (req, res) => {
    const followings = await this.followService.getFollowings(req.user.id);

    if (req.user?.id) {
      await Promise.all(
        (
          followings.docs as Array<
            FollowLeanDocument & { isFollowing: boolean }
          >
        ).map(async (follower) => {
          follower.isFollowing = await this.followService.checkIsFollowing(
            req.user.id,
            follower.followed._id
          );
        })
      );
    }

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followings'),
      body: {
        data: {
          pagination: followings.pagination,
          docs: followings.docs.map((doc) =>
            this.followMapper.toFollowingDto(doc)
          ),
        },
      },
    });
  };
}

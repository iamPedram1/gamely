import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'features/shared/user/core/user.service';
import BlockService from 'features/shared/user/block/block.service';
import FollowService from 'features/shared/user/follow/follow.service';

// Mapper
import { FollowMapper } from 'features/shared/user/follow/follow.mapper';

// Utilities
import sendResponse from 'core/utilities/response';
import type { FollowLeanDocumentWithMetadata } from 'features/shared/user/follow/follow.types';

@injectable()
export default class FollowController {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => FollowMapper))
    private followMapper: FollowMapper,
    @inject(delay(() => FollowService))
    private followService: FollowService,
    @inject(delay(() => BlockService))
    private blockService: BlockService
  ) {}

  follow: RequestHandler = async (req, res) => {
    await this.followService.follow(req.user.id, req.params.userId);

    sendResponse(res, 204);
  };

  unfollow: RequestHandler = async (req, res) => {
    await this.followService.unfollow(req.user.id, req.params.userId);

    sendResponse(res, 204);
  };

  getFollowers: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const { docs, pagination } = await this.followService.getFollowers(userId);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followers'),
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.followMapper.toFollowerDto(doc)),
        },
      },
    });
  };

  getFollowings: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const { docs, pagination } = await this.followService.getFollowings(userId);

    if (req.user?.id) {
      const actorId = req.user.id;
      await Promise.all(
        (docs as FollowLeanDocumentWithMetadata[]).map(async (doc) => {
          const targetId = doc.following._id;

          doc.isFollowing = await this.followService.checkIsFollowing(
            actorId,
            targetId
          );
        })
      );
    }

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followings'),
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.followMapper.toFollowingDto(doc)),
        },
      },
    });
  };

  getProfileFollowers: RequestHandler = async (req, res) => {
    const { docs, pagination } = await this.followService.getFollowers(
      req.user.id
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followers'),
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.followMapper.toFollowerDto(doc)),
        },
      },
    });
  };

  getProfileFollowings: RequestHandler = async (req, res) => {
    const actorId = req.user.id;
    const { docs, pagination } = await this.followService.getFollowings(
      req.user.id
    );

    await Promise.all(
      (docs as FollowLeanDocumentWithMetadata[]).map(async (doc) => {
        const targetId = doc.following._id;
        const [isBlocked, isFollowing] = await Promise.all([
          this.blockService.checkIsBlock(actorId, targetId),
          this.followService.checkIsFollowing(actorId, targetId),
        ]);

        doc.isBlocked = isBlocked;
        doc.isFollowing = isFollowing;
      })
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.follow.followings'),
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.followMapper.toFollowingDto(doc)),
        },
      },
    });
  };
}

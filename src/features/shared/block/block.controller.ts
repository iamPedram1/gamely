import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'features/shared/user/user.service';
import UserBlockService from 'features/shared/block/block.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { BlockMapper } from 'features/shared/block/block.mapper';

@injectable()
export default class BlockController {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => UserService))
    private userBlockMapper: BlockMapper,
    @inject(delay(() => UserBlockService))
    private userBlockService: UserBlockService
  ) {}

  block: RequestHandler = async (req, res) => {
    await this.userBlockService.block(req.params.targetId);

    sendResponse(res, 204);
  };

  unblock: RequestHandler = async (req, res) => {
    await this.userBlockService.unblock(req.params.targetId);

    sendResponse(res, 204);
  };

  getUserBlockList: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);
    const followers = await this.userBlockService.getBlockList(userId);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.userBlock.blocklist'),
      body: {
        data: {
          pagination: followers.pagination,
          docs: followers.docs.map((doc) =>
            this.userBlockMapper.toUserBlockDto(doc)
          ),
        },
      },
    });
  };
}

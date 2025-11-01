import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserBlockService from 'features/shared/user/block/block.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { BlockMapper } from 'features/shared/user/block/block.mapper';
import { BaseQueryDto } from 'core/dto/query';

@injectable()
export default class BlockController {
  constructor(
    @inject(delay(() => BlockMapper))
    private blockMapper: BlockMapper,
    @inject(delay(() => UserBlockService))
    private blockService: UserBlockService
  ) {}

  block: RequestHandler = async (req, res) => {
    await this.blockService.block(req.params.targetId);

    sendResponse(res, 204);
  };

  unblock: RequestHandler = async (req, res) => {
    await this.blockService.unblock(req.params.targetId);

    sendResponse(res, 204);
  };

  getUserBlockList: RequestHandler = async (req, res) => {
    const query = req.query as unknown as BaseQueryDto;

    const blocks = await this.blockService.getBlockList(req.user.id, { query });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('messages.block.blocklist'),
      body: {
        data: {
          pagination: blocks.pagination,
          docs: blocks.docs.map((doc) => this.blockMapper.toUserBlockDto(doc)),
        },
      },
    });
  };
}

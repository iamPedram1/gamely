import { delay, inject, injectable } from 'tsyringe';

// Service
import GameService from 'features/shared/game/game.service';

// DTO
import { GameMapper } from 'features/shared/game/game.mapper';

// Utilities
import sendResponse from 'core/utilites/response';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class GameClientController {
  constructor(
    @inject(delay(() => GameMapper)) private gameMapper: GameMapper,
    @inject(delay(() => GameService)) private gameService: GameService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.gameService.find({
      query,
      lean: true,
      populate: [
        { path: 'creator', populate: 'avatar' },
        { path: 'coverImage' },
      ],
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Game.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.gameMapper.toClientDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const game = await this.gameService.getOneBySlug(req.params.slug, {
      lean: true,
      populate: 'coverImage',
    });

    sendResponse(res, game ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'models.Game.singular',
      body: {
        data: game ? this.gameMapper.toClientDto(game) : null,
      },
    });
  };
}

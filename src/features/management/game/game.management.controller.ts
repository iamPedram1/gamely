import { delay, inject, injectable } from 'tsyringe';

// Service
import GameService from 'features/shared/game/game.service';

// DTO
import { GameMapper } from 'features/shared/game/game.mapper';

// Utilities
import { BaseQueryDto } from 'core/dto/query';
import { gamePopulate } from 'features/shared/game/game.constant';
import sendResponse, { sendBatchResponse } from 'core/utilites/response';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class GameManagementController {
  constructor(
    @inject(delay(() => GameMapper)) private gameMapper: GameMapper,
    @inject(delay(() => GameService)) private gameService: GameService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as BaseQueryDto;
    const filter = this.gameService.buildFilterFromQuery(query, {
      searchBy: [
        {
          operator: 'or',
          matchMode: 'contains',
          options: 'i',
          queryKey: 'search',
          modelKeys: ['translations.en.title', 'translations.fa.title'],
        },
      ],
    });

    const { pagination, docs } = await this.gameService.find({
      filter,
      query,
      lean: true,
      populate: gamePopulate,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Game.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.gameMapper.toManagementDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const docs = await this.gameService.find({
      query,
      paginate: false,
      lean: true,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Game.plural',
      body: {
        data: docs.map((doc) => this.gameMapper.toManagementSummaryDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const game = await this.gameService.getOneById(req.params.id, {
      lean: true,
      populate: 'coverImage',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Game.singular',
      body: {
        data: this.gameMapper.toManagementDto(game),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const game = await this.gameService.create(req.body, req.user.id, {
      populate: gamePopulate,
    });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Game.singular',
      body: { data: this.gameMapper.toManagementDto(game) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.gameService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Game.singular',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.gameService.batchDelete(req.body.ids as string[]);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Game.singular',
      body: {
        data: result,
        errors: result.errors,
        isSuccess: result.isAllSucceed,
        message: result.isAllSucceed
          ? req.t('messages.batch.completed')
          : req.t('messages.batch.completed_with_error'),
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const body = await this.gameService.updateOneById(req.params.id, req.body, {
      lean: true,
      populate: gamePopulate,
    });

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Game.singular',
      body: { data: this.gameMapper.toManagementDto(body) },
    });
  };
}

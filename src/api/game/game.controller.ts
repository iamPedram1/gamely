import { delay, inject, injectable } from 'tsyringe';

// Service
import GameService from 'api/game/game.service';

// Dto
import { GameMapper } from 'api/game/game.mapper';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';
import { ValidationError } from 'utilites/errors';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'types/query';

@injectable()
export default class GameController {
  constructor(
    @inject(delay(() => GameMapper)) private gameMapper: GameMapper,
    @inject(delay(() => GameService)) private gameService: GameService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.gameService.find({
      reqQuery,
      lean: true,
      populate: 'coverImage creator',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Games',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.gameMapper.toDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.gameService.find({
      reqQuery,
      lean: true,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Games',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.gameMapper.toSummaryDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const game = await this.gameService.getOneById(req.params.id, {
      lean: true,
      populate: 'coverImage',
    });

    sendResponse(res, game ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Game',
      body: {
        data: game ? this.gameMapper.toDto(game) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const game = await this.gameService.create(req.body, req.user._id, {
      populate: 'coverImage creator',
    });

    sendResponse(res, game ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Game',
      body: { data: game ? this.gameMapper.toDto(game) : null },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.gameService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Game',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.gameService.batchDelete(req.body.ids as string[]);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Game',
      body: {
        data: result,
        errors: result.errors,
        isSuccess: result.isAllSucceed,
        message: result.isAllSucceed
          ? 'Batch operation completed successfuly'
          : 'Operation completed with some errors',
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const body = await this.gameService.updateOneById(req.params.id, req.body, {
      populate: 'coverImage creator',
      lean: true,
    });

    if (!body) throw new ValidationError('Error in updating game');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Game',
      body: { data: this.gameMapper.toDto(body) },
    });
  };
}

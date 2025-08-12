import type { RequestHandler } from 'express';
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';
import IRequestQueryBase from 'types/query';
import { IGameService } from 'api/game/game.service';
import { IGameMapper } from 'api/game/game.mapper';
import { ValidationError } from 'utilites/errors';
import sendResponse from 'utilites/response';

export default class GameController {
  private gameService: IGameService;
  private gameMapper: IGameMapper;

  constructor(gameService: IGameService, gameMapper: IGameMapper) {
    this.gameService = gameService;
    this.gameMapper = gameMapper;
  }

  getAll: RequestHandler = async (req, res) => {
    const { pagination, docs } = await this.gameService.getAll(
      req.query as unknown as IRequestQueryBase
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Games',
      body: {
        data: {
          pagination,
          docs: docs.map((game) => this.gameMapper.toGameDto(game)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const { pagination, docs } = await this.gameService.getAllSummaries(
      req.query as unknown as IRequestQueryBase
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Games',
      body: {
        data: {
          pagination,
          docs: docs.map((game) => this.gameMapper.toGameSummaryDto(game)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const game = await this.gameService.getById(req.params.id);

    sendResponse(res, game ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Game',
      body: {
        data: game ? this.gameMapper.toGameDto(game) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateGameDto;

    const game = await this.gameService.create(dto, req.user._id);

    sendResponse(res, game ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Game',
      body: { data: this.gameMapper.toGameDto(game) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const game = await this.gameService.deleteById(req.params.id);
    const deleted = game.deletedCount > 0;

    sendResponse(res, deleted ? 200 : 400, {
      httpMethod: 'DELETE',
      featureName: 'Game',
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateGameDto;

    const body = await this.gameService.update(req.params.id, dto);

    if (!body) throw new ValidationError('Error in updating game');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Game',
      body: { data: this.gameMapper.toGameDto(body) },
    });
  };
}

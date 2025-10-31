import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'features/shared/user/user.service';
import FavoriteGameService from 'features/shared/favoriteGame/favoriteGame.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { GameMapper } from 'features/shared/game/game.mapper';
import { FavoriteGamePopulatedDocument } from 'features/shared/favoriteGame/favoriteGame.types';

@injectable()
export default class FavoriteGameController {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService,
    @inject(delay(() => GameMapper))
    private gameMapper: GameMapper,
    @inject(delay(() => FavoriteGameService))
    private favoriteGameService: FavoriteGameService
  ) {}

  getFavoriteGames: RequestHandler = async (req, res) => {
    const userId = await this.userService.getIdByUsername(req.params.username);

    const { docs, pagination } =
      await this.favoriteGameService.getFavoriteGames(userId);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Game.plural',
      body: {
        data: {
          pagination,
          docs: (docs as FavoriteGamePopulatedDocument[]).map((doc) =>
            this.gameMapper.toClientDto(doc.game)
          ),
        },
      },
    });
  };
}

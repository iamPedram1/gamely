import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import FavoriteGameService from 'features/shared/favoriteGame/favoriteGame.service';

// Utilities
import sendResponse from 'core/utilities/response';

@injectable()
export default class FavoriteGamePrivateController {
  constructor(
    @inject(delay(() => FavoriteGameService))
    private favoriteGameService: FavoriteGameService
  ) {}

  favoriteGame: RequestHandler = async (req, res) => {
    await this.favoriteGameService.favorite(req.params.gameId);

    sendResponse(res, 204);
  };

  unfavoriteGame: RequestHandler = async (req, res) => {
    await this.favoriteGameService.unfavorite(req.params.gameId);

    sendResponse(res, 204);
  };
}

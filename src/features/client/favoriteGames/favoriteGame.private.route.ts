import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';

// Model
import Game from 'features/shared/game/game.model';

// Controller
import FavoriteGamePrivateController from 'features/client/favoriteGames/favoriteGame.private.controller';

// DTO
import { validateParam } from 'core/middlewares/validations';

const favoriteGamePrivateRouter = express.Router({ mergeParams: true });
const favoriteGameController = container.resolve(FavoriteGamePrivateController);

// <----------------   GET   ---------------->
const accessMiddleware = auth(['user', 'author', 'admin', 'superAdmin']);

favoriteGamePrivateRouter.post(
  '/:gameId',
  accessMiddleware,
  validateParam(Game, 'gameId', '_id', { type: 'id' }),
  favoriteGameController.favoriteGame
);

// <----------------   DELETE   ---------------->
favoriteGamePrivateRouter.delete(
  '/:gameId',
  accessMiddleware,
  validateParam(Game, 'gameId', '_id', { type: 'id' }),
  favoriteGameController.unfavoriteGame
);

export default favoriteGamePrivateRouter;

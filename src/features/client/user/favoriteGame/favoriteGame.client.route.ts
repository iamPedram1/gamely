import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';

// Model
import Game from 'features/shared/game/core/game.model';

// Controller
import FavoriteGameClientController from 'features/client/user/favoriteGame/favoriteGame.client.controller';

// DTO
import { validateParam } from 'core/middlewares/validations';

const favoriteGameClientRouter = express.Router({ mergeParams: true });
const favoriteGameController = container.resolve(FavoriteGameClientController);

// <----------------   GET   ---------------->
const accessMiddleware = auth(['user', 'author', 'admin', 'superAdmin']);

favoriteGameClientRouter.post(
  '/:gameId',
  accessMiddleware,
  validateParam(Game, 'gameId', '_id', { type: 'id' }),
  favoriteGameController.favoriteGame
);

// <----------------   DELETE   ---------------->
favoriteGameClientRouter.delete(
  '/:gameId',
  accessMiddleware,
  validateParam(Game, 'gameId', '_id', { type: 'id' }),
  favoriteGameController.unfavoriteGame
);

export default favoriteGameClientRouter;

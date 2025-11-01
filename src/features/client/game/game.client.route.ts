import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import { validateQuery } from 'core/middlewares/validateQuery';

// Model
import Game from 'features/shared/game/core/game.model';

// Controller
import GameClientController from 'features/client/game/game.client.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { validateParam } from 'core/middlewares/validations';
import { initializeContext } from 'core/middlewares/context';

const gameClientRouter = express.Router();
const gameController = container.resolve(GameClientController);

// <----------------   GET   ---------------->
gameClientRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameClientRouter.get(
  '/:slug',
  validateParam(Game, 'slug', 'slug'),
  initializeContext,
  gameController.getOne
);

export default gameClientRouter;

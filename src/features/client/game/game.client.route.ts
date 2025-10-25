import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import validateObjectId from 'core/middlewares/validateObjectId';
import { validateQuery } from 'core/middlewares/validateQuery';

// Model
import Game from 'features/shared/game/game.model';

// Controller
import GameClientController from 'features/client/game/game.client.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { validateParam } from 'core/middlewares/validateParams';

const gameClientRouter = express.Router();
const gameController = container.resolve(GameClientController);

// <----------------   GET   ---------------->
gameClientRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameClientRouter.get('/:slug', [
  validateParam(Game, 'slug', 'slug'),
  gameController.getOne,
]);

export default gameClientRouter;

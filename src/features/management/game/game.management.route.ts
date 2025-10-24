import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateQuery from 'core/middlewares/validateQuery';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Game from 'features/shared/game/game.model';

// Controller
import GameManagementController from 'features/management/game/game.management.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import {
  CreateGameDto,
  UpdateGameDto,
} from 'features/management/game/game.management.dto';

const gameManagementRouter = express.Router();
const gameController = container.resolve(GameManagementController);

gameManagementRouter.use(auth(['author', 'admin']));

// <----------------   GET   ---------------->
gameManagementRouter.get('/', [
  validateQuery(BaseQueryDto),
  gameController.getAll,
]);
gameManagementRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  gameController.getAllSummaries,
]);
gameManagementRouter.get('/:id', [
  validateObjectId(Game),
  gameController.getOne,
]);

// <----------------   DELETE   ---------------->
gameManagementRouter.delete('/batch/delete', gameController.batchDelete);
gameManagementRouter.delete('/:id', [
  validateObjectId(Game),
  gameController.delete,
]);

// <----------------   POST   ---------------->
gameManagementRouter.post('/', [
  validateBody(CreateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.create,
]);

// <----------------   PATCH   ---------------->
gameManagementRouter.patch('/:id', [
  validateObjectId(Game),
  validateBody(UpdateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.update,
]);

export default gameManagementRouter;

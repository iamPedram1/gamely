import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateQuery from 'core/middlewares/validateQuery';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Game from 'api/game/game.model';

// Controller
import GameController from 'api/game/game.controller';

// Dto
import { BaseQueryDto } from 'core/dto/query';
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';

const gameRouter = express.Router();
const gameController = container.resolve(GameController);

// Public Routes
gameRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  gameController.getAllSummaries,
]);
gameRouter.get('/:id', [validateObjectId(Game), gameController.getOne]);

// Protected Routes
gameRouter.use(auth(['author', 'admin']));
gameRouter.delete('/batch/delete', gameController.batchDelete);
gameRouter.delete('/:id', [validateObjectId(Game), gameController.delete]);
gameRouter.post('/', [
  validateBody(CreateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.create,
]);
gameRouter.patch('/:id', [
  validateObjectId(Game),
  validateBody(UpdateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.update,
]);

export default gameRouter;

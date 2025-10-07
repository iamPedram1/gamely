import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Game from 'api/game/game.model';

// Module
import createGameModule from 'api/game/game.module';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';

const gameRouter = express.Router();
const { gameController } = createGameModule();

// Public Routes
gameRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  gameController.getAllSummaries,
]);
gameRouter.get('/:id', [validateObjectId(Game), gameController.getOne]);

// Protected Routes
gameRouter.use(auth);
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

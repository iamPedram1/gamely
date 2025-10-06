import express from 'express';

// Midllewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Game from 'api/game/game.model';

// Controllers
import GameController from 'api/game/game.controller';

// Services
import GameService from 'api/game/game.service';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';
import { GameMapper } from 'api/game/game.mapper';

const gameRouter = express.Router();
const gameMapper = new GameMapper();
const gameService = new GameService();
const gameController = new GameController(gameService, gameMapper);

// Public Routes
gameRouter.get('/:id', [validateObjectId(Game), gameController.getOne]);
gameRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  gameController.getAllSummaries,
]);

// Protected Routes
gameRouter.use(auth);
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

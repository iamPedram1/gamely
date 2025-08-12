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

const gameService = new GameService();
const gameMapper = new GameMapper();
const gameController = new GameController(gameService, gameMapper);

gameRouter.post('/', [
  auth,
  validateBody(CreateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.create,
]);
gameRouter.get('/', [validateQuery(BaseQueryDto), gameController.getAll]);
gameRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  gameController.getAllSummaries,
]);
gameRouter.get('/:id', [validateObjectId(Game), gameController.getOne]);
gameRouter.patch('/:id', [
  auth,
  validateObjectId(Game),
  validateBody(UpdateGameDto),
  validateUniqueConflict(Game, 'slug'),
  gameController.update,
]);
gameRouter.delete('/:id', [
  auth,
  validateObjectId(Game),
  gameController.delete,
]);

export default gameRouter;

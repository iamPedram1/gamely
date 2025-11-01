import express from 'express';
import { container } from 'tsyringe';

// Model
import Game from 'features/shared/game/core/game.model';

// Middleware
import auth from 'core/middlewares/auth';
import { validateParam } from 'core/middlewares/validations';

// Controller
import GameReviewController from 'features/shared/game/gameReview/gameReview.controller';

const gameReviewRouter = express.Router({ mergeParams: true });
const gameReviewController = container.resolve(GameReviewController);

// <----------------   GET   ---------------->

gameReviewRouter.get(
  '/',
  validateParam(Game, 'id', '_id', { type: 'id' }),
  gameReviewController.getGameReviews
);

gameReviewRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));
gameReviewRouter.post(
  '/',
  validateParam(Game, 'id', '_id', { type: 'id' }),
  gameReviewController.createReview
);

gameReviewRouter.patch(
  '/',
  validateParam(Game, 'id', '_id', { type: 'id' }),
  gameReviewController.updateReview
);

gameReviewRouter.delete(
  '/',
  validateParam(Game, 'id', '_id', { type: 'id' }),
  gameReviewController.deleteReview
);

export default gameReviewRouter;

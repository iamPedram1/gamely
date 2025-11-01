import express from 'express';
import { container } from 'tsyringe';

// Controller
import FavoriteGameController from 'features/shared/user/favoriteGame/favoriteGame.controller';

const favoriteGamePublicRouter = express.Router({ mergeParams: true });
const favoriteGameController = container.resolve(FavoriteGameController);

// <----------------   GET   ---------------->

favoriteGamePublicRouter.get('/', favoriteGameController.getFavoriteGames);

export default favoriteGamePublicRouter;

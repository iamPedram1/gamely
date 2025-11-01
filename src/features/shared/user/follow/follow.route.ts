import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import { softValidateQuery } from 'core/middlewares/validateQuery';

// Model
import User from 'features/shared/user/core/user.model';

// Controller
import FollowController from 'features/shared/user/follow/follow.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { validateParam } from 'core/middlewares/validations';
import { initializeContext } from 'core/middlewares/context';

const followRouter = express.Router();
const followController = container.resolve(FollowController);

// <----------------   GET   ---------------->

const accessMiddleware = auth(['user', 'author', 'admin', 'superAdmin']);

followRouter.get(
  '/followers',
  accessMiddleware,
  followController.getProfileFollowers
);
followRouter.get(
  '/followings',
  accessMiddleware,
  followController.getProfileFollowings
);
followRouter.get(
  '/:username/followers',
  softValidateQuery(BaseQueryDto),
  validateParam(User, 'username', 'username'),
  followController.getFollowers
);
followRouter.get(
  '/:username/followings',
  softValidateQuery(BaseQueryDto),
  validateParam(User, 'username', 'username'),
  initializeContext,
  followController.getFollowings
);

// <----------------   POST   ---------------->

followRouter.post(
  '/:userId/follow',
  accessMiddleware,
  softValidateQuery(BaseQueryDto),
  followController.follow
);

// <----------------   DELETE   ---------------->
followRouter.delete(
  '/:userId/unfollow',
  accessMiddleware,
  validateParam(User, 'userId', '_id', { type: 'id' }),
  followController.unfollow
);

export default followRouter;

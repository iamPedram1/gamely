import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import { softValidateQuery } from 'core/middlewares/validateQuery';

// Model
import User from 'features/shared/user/user.model';

// Controller
import UserFollowController from 'features/shared/userFollow/userFollow.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { validateParam } from 'core/middlewares/validateParams';
import { initializeContext } from 'core/middlewares/context';

const userFollowRouter = express.Router();
const userFollowController = container.resolve(UserFollowController);

// <----------------   GET   ---------------->

const accessMiddleware = auth(['user', 'author', 'admin', 'superAdmin']);

userFollowRouter.get(
  '/profile/followers',
  accessMiddleware,
  userFollowController.getProfileFollowers
);
userFollowRouter.get(
  '/profile/followings',
  accessMiddleware,
  userFollowController.getProfileFollowings
);
userFollowRouter.get(
  '/:username/followers',
  softValidateQuery(BaseQueryDto),
  validateParam(User, 'username', 'username'),
  userFollowController.getUserFollowers
);
userFollowRouter.get(
  '/:username/followings',
  softValidateQuery(BaseQueryDto),
  validateParam(User, 'username', 'username'),
  initializeContext,
  userFollowController.getUserFollowings
);

// <----------------   POST   ---------------->

userFollowRouter.post(
  '/:userId/follow',
  accessMiddleware,
  softValidateQuery(BaseQueryDto),
  userFollowController.follow
);

// <----------------   DELETE   ---------------->
userFollowRouter.delete(
  '/:userId/unfollow',
  accessMiddleware,
  validateParam(User, 'userId', '_id', { type: 'id' }),
  userFollowController.unfollow
);

export default userFollowRouter;

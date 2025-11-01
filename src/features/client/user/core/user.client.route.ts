import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';

// Controller
import UserClientController from 'features/client/user/core/user.client.controller';

// DTO
import { UpdateProfileDto } from 'features/client/user/core/user.client.dto';
import { initializeContext } from 'core/middlewares/context';

const userClientRouter = express.Router();
const userClientController = container.resolve(UserClientController);

const accessMiddleware = auth(['user', 'author', 'admin', 'superAdmin']);

// <----------------   GET   ---------------->
userClientRouter.get(
  '/profile',
  accessMiddleware,
  userClientController.getProfile
);
userClientRouter.get(
  '/:username',
  initializeContext,
  userClientController.getUser
);

// <----------------   PATCH  ---------------->
userClientRouter.patch(
  '/profile',
  accessMiddleware,
  validateBody(UpdateProfileDto),
  userClientController.update
);

export default userClientRouter;

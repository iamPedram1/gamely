import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';

// Controller
import UserClientController from 'features/client/user/user.client.controller';

// DTO
import { UpdateProfileDto } from 'features/client/user/user.client.dto';

const userClientRouter = express.Router();
const userClientController = container.resolve(UserClientController);

userClientRouter.use(auth(['user', 'admin', 'author']));

// <----------------   GET   ---------------->
userClientRouter.get('/profile', userClientController.getProfile);

// <----------------   PATCH  ---------------->
userClientRouter.patch(
  '/profile',
  validateBody(UpdateProfileDto),
  userClientController.update
);

export default userClientRouter;

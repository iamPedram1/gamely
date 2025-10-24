import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import UserClientController from 'features/client/user/user.client.controller';
import { UpdateProfileDto } from 'features/client/user/user.client.dto';

// Controller

// DTO

const userClientRouter = express.Router();
const userClientController = container.resolve(UserClientController);

// Protected Routes
userClientRouter.use(auth(['user', 'admin', 'author']));
userClientRouter.get('/profile', userClientController.getProfile);
userClientRouter.patch(
  '/profile',
  validateBody(UpdateProfileDto),
  userClientController.update
);

export default userClientRouter;

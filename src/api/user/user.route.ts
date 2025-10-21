import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';

// Controller
import UserController from 'api/user/user.controller';

// Dto
import { UpdateProfileDto } from 'api/user/user.dto';

const userRouter = express.Router();
const userController = container.resolve(UserController);

// Protected Routes
userRouter.use(auth(['user']));
userRouter.get('/profile', userController.getProfile);
userRouter.patch(
  '/profile',
  validateBody(UpdateProfileDto),
  userController.update
);

export default userRouter;

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';

// Model
import User from 'api/user/user.model';

// Controller
import UserController from 'api/user/user.controller';

// Dto
import { UpdateProfileDto } from 'api/user/user.dto';

const userRouter = express.Router();
const userController = container.resolve(UserController);

// Protected Routes
userRouter.use(auth);
userRouter.get('/profile', userController.getProfile);
userRouter.patch(
  '/profile',
  validateBody(UpdateProfileDto),
  userController.update
);

export default userRouter;

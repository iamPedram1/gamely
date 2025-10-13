import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';

// Controller
import UserController from 'api/user/user.controller';

// Dto
import { RefreshTokenDto, UpdateProfileDto } from 'api/user/user.dto';

const userRouter = express.Router();
const userController = container.resolve(UserController);

// Protected Routes
userRouter.post(
  '/token/refresh',
  validateBody(RefreshTokenDto),
  userController.refreshToken
);
userRouter.use(auth);
userRouter.post('/token/revoke', userController.revokeToken);
userRouter.get('/profile', userController.getProfile);
userRouter.patch(
  '/profile',
  validateBody(UpdateProfileDto),
  userController.update
);

export default userRouter;

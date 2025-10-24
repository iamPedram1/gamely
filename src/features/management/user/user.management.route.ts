import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';

// Controller
import UserManagementController from 'features/management/user/user.management.controller';

// DTO
import { UpdateUserDto } from 'features/management/user/user.management.dto';

const userManagementRouter = express.Router();
const userController = container.resolve(UserManagementController);

// Protected Routes
userManagementRouter.use(auth(['admin']));
userManagementRouter.get('/', userController.getAll);
userManagementRouter.get('/summaries', userController.getSummaries);

userManagementRouter.get('/:id', userController.getOne);
userManagementRouter.patch(
  '/:id',
  validateBody(UpdateUserDto),
  userController.update
);

export default userManagementRouter;

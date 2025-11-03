import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { softValidateQuery } from 'core/middlewares/validateQuery';

// Controller
import UserManagementController from 'features/management/user/core/user.management.controller';

// DTO
import {
  UpdateUserDto,
  UserManagementQueryDto,
} from 'features/management/user/core/user.management.dto';

const userManagementRouter = express.Router();
const userController = container.resolve(UserManagementController);

userManagementRouter.use(auth(['admin', 'superAdmin']));

// <----------------   GET   ---------------->
userManagementRouter.get(
  '/',
  softValidateQuery(UserManagementQueryDto),
  userController.getAll
);
userManagementRouter.get('/summaries', userController.getSummaries);
userManagementRouter.get('/:id', userController.getOne);

// <----------------   PATCH  ---------------->
userManagementRouter.patch(
  '/:id',
  validateBody(UpdateUserDto),
  userController.update
);

export default userManagementRouter;

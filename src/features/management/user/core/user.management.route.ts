import express from 'express';
import { container } from 'tsyringe';

// Models
import User from 'features/shared/user/core/user.model';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateParam } from 'core/middlewares/validations';
import { softValidateQuery } from 'core/middlewares/validateQuery';
import ensureUnique from 'core/middlewares/ensureUnique';

// Controller
import UserManagementController from 'features/management/user/core/user.management.controller';

// Utilities
import { NotFoundError } from 'core/utilities/errors';

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
userManagementRouter.get(
  '/:id',
  validateParam(User, 'id', '_id', { type: 'id' }),
  userController.getOne
);

// <----------------   PATCH  ---------------->
userManagementRouter.patch(
  '/:id',
  validateBody(UpdateUserDto),
  validateParam(User, 'id', '_id', { type: 'id' }),
  ensureUnique(User, 'username', 'username', 'id'),
  userController.update
);

export default userManagementRouter;

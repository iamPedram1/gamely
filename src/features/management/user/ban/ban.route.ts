import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';

// Model
import User from 'features/shared/user/core/user.model';

// Controller
import UserBanController from 'features/management/user/ban/ban.controller';

// DTO
import { validateParam } from 'core/middlewares/validations';
import { CreateBanDto } from 'features/management/user/ban/ban.dto';

const userBanRouter = express.Router();
const userBanController = container.resolve(UserBanController);

userBanRouter.use(auth(['admin', 'superAdmin']));

// <----------------   GET   ---------------->
userBanRouter.get('/', userBanController.getBanList);

// <----------------   POST   ---------------->
userBanRouter.post(
  '/:targetId/ban',
  validateBody(CreateBanDto),
  validateParam(User, 'targetId', '_id', { type: 'id' }),
  userBanController.ban
);

// <----------------   DELETE   ---------------->
userBanRouter.delete(
  '/:targetId/unban',
  validateParam(User, 'targetId', '_id', { type: 'id' }),
  userBanController.unban
);

export default userBanRouter;

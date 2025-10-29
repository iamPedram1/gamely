import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';

// Model
import User from 'features/shared/user/user.model';

// Controller
import FollowController from 'features/shared/block/block.controller';

// DTO
import { validateParam } from 'core/middlewares/validateParams';

const blockRouter = express.Router();
const blockController = container.resolve(FollowController);

// <----------------   GET   ---------------->

blockRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));

blockRouter.get('/', blockController.getUserBlockList);

// <----------------   POST   ---------------->

blockRouter.post('/:targetId/block', blockController.block);

// <----------------   DELETE   ---------------->
blockRouter.delete(
  '/:targetId/unblock',
  validateParam(User, 'targetId', '_id', { type: 'id' }),
  blockController.unblock
);

export default blockRouter;

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateParam } from 'core/middlewares/validateParams';

// Model
import Comment from 'features/shared/comment/comment.model';

// Controller
import CommentManagementController from 'features/management/comment/comment.management.controller';

// DTO
import { UpdateCommentDto } from 'features/management/comment/comment.management.dto';

const commentManagementRouter = express.Router();
const commentController = container.resolve(CommentManagementController);

commentManagementRouter.use(auth(['author', 'admin', 'superAdmin']));

// <----------------   GET   ---------------->
commentManagementRouter.get('/', commentController.getAll);
commentManagementRouter.get(
  '/:id',
  validateParam(Comment, 'id', '_id', { type: 'id' }),
  commentController.getPostComments
);

// <----------------   PATCH   ---------------->
commentManagementRouter.patch(
  '/:id',
  validateParam(Comment, 'id', '_id', { type: 'id' }),
  validateBody(UpdateCommentDto),
  commentController.update
);
// <----------------   DELETE   ---------------->
commentManagementRouter.delete(
  '/:id',
  validateParam(Comment, 'id', '_id', { type: 'id' }),
  commentController.delete
);

export default commentManagementRouter;

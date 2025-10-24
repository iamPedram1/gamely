import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateParam } from 'core/middlewares/validateParams';

// Model
import Post from 'features/shared/post/post.model';
import Comment from 'features/shared/comment/comment.model';

// Controller
import CommentManagementController from 'features/management/comment/comment.management.controller';

// DTO
import { UpdateCommentDto } from 'features/management/comment/comment.management.dto';

const commentManagementRouter = express.Router();
const commentController = container.resolve(CommentManagementController);

commentManagementRouter.use(auth(['author', 'admin']));

// ----------------   GET   ----------------
commentManagementRouter.get(
  '/:id/comments',
  validateParam(Post, 'id', '_id', { isId: true }),
  commentController.getPostComments
);

// ----------------   PATCH   ----------------
commentManagementRouter.patch(
  '/:postId/comments/:commentId',
  validateParam(Post, 'postId', '_id', { isId: true }),
  validateParam(Comment, 'commentId', '_id', { isId: true }),
  validateBody(UpdateCommentDto),
  commentController.update
);
// ----------------   DELETE   ----------------
commentManagementRouter.delete(
  '/:postId/comments/:commentId',
  validateParam(Post, 'postId', '_id', { isId: true }),
  validateParam(Comment, 'commentId', '_id', { isId: true }),
  commentController.delete
);

export default commentManagementRouter;

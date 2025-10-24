import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import CommentController from 'api/comment/comment.controller';

// DTO
import { CreateCommentDto } from 'api/comment/comment.dto';

const commentRouter = express.Router();
const commentController = container.resolve(CommentController);

// Public Routes
commentRouter.get(
  '/:id/comments',
  validateObjectId(Post),
  commentController.getPostComments
);

// Protected Routes
commentRouter.use(auth);
commentRouter.post(
  '/:id/comments',
  validateObjectId(Post),
  validateBody(CreateCommentDto),
  commentController.create
);

export default commentRouter;

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';

// Model
import Post from 'api/post/post.model';

// Controller
import CommentController from 'api/comment/comment.controller';

// Dto
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

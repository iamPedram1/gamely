import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateQuery from 'middleware/validateQuery';
import validateObjectId from 'middleware/validateObjectId';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Post from 'api/post/post.model';
import Comment from 'api/comment/comment.model';

// Module
import createCommentModule from 'api/comment/comment.module';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreateCommentDto } from 'api/comment/comment.dto';

const commentRouter = express.Router();
const { commentController } = createCommentModule();

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

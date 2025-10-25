import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import CommentClientController from 'features/client/comment/comment.client.controller';

// DTO
import { CreateCommentDto } from 'features/client/comment/comment.client.dto';

const commentClientRouter = express.Router();
const commentController = container.resolve(CommentClientController);

// <----------------   GET   ---------------->
commentClientRouter.get(
  '/:id/comments',
  validateObjectId(Post),
  commentController.getComments
);

// <----------------   POST   ---------------->
commentClientRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));
commentClientRouter.post(
  '/:id/comments',
  validateObjectId(Post),
  validateBody(CreateCommentDto),
  commentController.create
);

export default commentClientRouter;

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Post from 'features/shared/post/core/post.model';

// Controller
import CommentClientController from 'features/client/post/comment/comment.client.controller';

// DTO
import { CreateCommentDto } from 'features/client/post/comment/comment.client.dto';

const commentClientRouter = express.Router({ mergeParams: true });
const commentController = container.resolve(CommentClientController);

// <----------------   GET   ---------------->
commentClientRouter.get(
  '/',
  validateObjectId(Post),
  commentController.getComments
);

// <----------------   POST   ---------------->
commentClientRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));
commentClientRouter.post(
  '/',
  validateBody(CreateCommentDto),
  validateObjectId(Post),
  commentController.create
);

export default commentClientRouter;

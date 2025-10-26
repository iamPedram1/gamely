import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import { softValidateQuery } from 'core/middlewares/validateQuery';
import { validateParam } from 'core/middlewares/validateParams';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostClientController from 'features/client/post/post.client.controller';
import { PostClientQueryDto } from 'features/client/post/post.client.dto';

// DTO

export const postClientRouter = express.Router();
const postController = container.resolve(PostClientController);

// <----------------   GET   ---------------->
postClientRouter.get('/', [
  softValidateQuery(PostClientQueryDto),
  postController.getAll,
]);
postClientRouter.get('/:slug', [
  validateParam(Post, 'slug', 'slug'),
  postController.getOne,
]);

export default postClientRouter;

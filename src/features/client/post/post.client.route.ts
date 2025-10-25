import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import { validateQuery } from 'core/middlewares/validateQuery';
import { validateParam } from 'core/middlewares/validateParams';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostClientController from 'features/client/post/post.client.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';

export const postClientRouter = express.Router();
const postController = container.resolve(PostClientController);

// <----------------   GET   ---------------->
postClientRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postClientRouter.get('/:slug', [
  validateParam(Post, 'slug', 'slug'),
  postController.getOne,
]);

export default postClientRouter;

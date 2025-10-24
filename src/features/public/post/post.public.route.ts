import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostPublicController from 'features/public/post/post.controller';

// Dto
import { BaseQueryDto } from 'core/dto/query';

export const postPublicRouter = express.Router();
const postController = container.resolve(PostPublicController);

postPublicRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postPublicRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postPublicRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

export default postPublicRouter;

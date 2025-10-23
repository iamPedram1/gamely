import express from 'express';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateQuery from 'core/middlewares/validateQuery';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Post from 'api/post/post.model';

// Controller
import PostController from 'api/post/post.controller';

// Dto
import { BaseQueryDto } from 'core/dto/query';
import { container } from 'tsyringe';

const postUserRouter = express.Router();
const postController = container.resolve(PostController);

postUserRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postUserRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postUserRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

export default postUserRouter;

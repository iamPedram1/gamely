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
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';
import { container } from 'tsyringe';

const postRouter = express.Router();
const postController = container.resolve(PostController);

// Public Routes
postRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

// Protected Routes
postRouter.use(auth(['author', 'admin']));
postRouter.delete('/batch/delete', [postController.batchDelete]);
postRouter.delete('/:id', [validateObjectId(Post), postController.delete]);
postRouter.post('/', [
  validateUniqueConflict(Post, 'slug'),
  validateBody(CreatePostDto),
  postController.create,
]);
postRouter.patch('/:id', [
  validateObjectId(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postRouter;

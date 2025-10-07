import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Post from 'api/post/post.model';

// Module
import createPostModule from 'api/post/post.module';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

const postRouter = express.Router();
const { postController } = createPostModule();

// Public Routes
postRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

// Protected Routes
postRouter.use(auth);
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

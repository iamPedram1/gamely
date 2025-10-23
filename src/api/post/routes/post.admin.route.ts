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
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';
import { container } from 'tsyringe';

const postAdminRouter = express.Router();
const postController = container.resolve(PostController);

// Protected Routes
postAdminRouter.use(auth(['author', 'admin']));
postAdminRouter.delete('/batch/delete', [postController.batchDelete]);
postAdminRouter.delete('/:id', [validateObjectId(Post), postController.delete]);
postAdminRouter.post('/', [
  validateUniqueConflict(Post, 'slug'),
  validateBody(CreatePostDto),
  postController.create,
]);
postAdminRouter.patch('/:id', [
  validateObjectId(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postAdminRouter;

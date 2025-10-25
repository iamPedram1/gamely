import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { softValidateQuery } from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostManagementController from 'features/management/post/post.management.controller';

// DTO
import { PostQueryDto } from 'features/shared/post/post.dto';
import {
  CreatePostDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

export const postManagementRouter = express.Router();
const postController = container.resolve(PostManagementController);

postManagementRouter.use(auth(['author', 'admin', 'superAdmin']));

// <----------------   GET   ---------------->
postManagementRouter.get('/', [
  softValidateQuery(PostQueryDto),
  postController.getAll,
]);
postManagementRouter.get('/summaries', [
  softValidateQuery(PostQueryDto),
  postController.getAllSummaries,
]);
postManagementRouter.get('/:id', [
  validateObjectId(Post),
  postController.getOne,
]);

// <----------------   DELETE   ---------------->
postManagementRouter.delete('/batch/delete', [postController.batchDelete]);
postManagementRouter.delete('/:id', [
  validateObjectId(Post),
  postController.delete,
]);

// <----------------   POST   ---------------->
postManagementRouter.post('/', [
  validateUniqueConflict(Post, 'slug'),
  validateBody(CreatePostDto),
  postController.create,
]);

// <----------------   PATCH  ---------------->
postManagementRouter.patch('/:id', [
  validateObjectId(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postManagementRouter;

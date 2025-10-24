import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostMangementController from 'features/management/post/post.management.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import {
  CreatePostDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

export const postManagementRouter = express.Router();
const postController = container.resolve(PostMangementController);

postManagementRouter.use(auth(['author', 'admin']));
postManagementRouter.get('/', [
  validateQuery(BaseQueryDto),
  postController.getAll,
]);
postManagementRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postManagementRouter.get('/:id', [
  validateObjectId(Post),
  postController.getOne,
]);

postManagementRouter.delete('/batch/delete', [postController.batchDelete]);
postManagementRouter.delete('/:id', [
  validateObjectId(Post),
  postController.delete,
]);
postManagementRouter.post('/', [
  validateUniqueConflict(Post, 'slug'),
  validateBody(CreatePostDto),
  postController.create,
]);
postManagementRouter.patch('/:id', [
  validateObjectId(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postManagementRouter;

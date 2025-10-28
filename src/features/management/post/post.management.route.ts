import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateParam } from 'core/middlewares/validateParams';
import { softValidateQuery } from 'core/middlewares/validateQuery';
import validateDocumentExistById from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Tag from 'features/shared/tag/tag.model';
import Post from 'features/shared/post/post.model';
import Game from 'features/shared/game/game.model';
import Category from 'features/shared/category/category.model';

// Controller
import PostManagementController from 'features/management/post/post.management.controller';

// DTO
import {
  CreatePostDto,
  PostManagementQueryDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

export const postManagementRouter = express.Router();
const postController = container.resolve(PostManagementController);

postManagementRouter.use(auth(['author', 'admin', 'superAdmin']));

// <----------------   GET   ---------------->
postManagementRouter.get('/', [
  softValidateQuery(PostManagementQueryDto),
  postController.getAll,
]);
postManagementRouter.get('/summaries', [
  softValidateQuery(PostManagementQueryDto),
  postController.getAllSummaries,
]);
postManagementRouter.get('/:id', [
  validateDocumentExistById(Post),
  postController.getOne,
]);

// <----------------   DELETE   ---------------->
postManagementRouter.delete('/batch/delete', [postController.batchDelete]);
postManagementRouter.delete('/:id', [
  validateDocumentExistById(Post),
  postController.delete,
]);

// <----------------   POST   ---------------->
postManagementRouter.post('/', [
  validateBody(CreatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.create,
]);

// <----------------   PATCH  ---------------->
postManagementRouter.patch('/:id', [
  validateDocumentExistById(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postManagementRouter;

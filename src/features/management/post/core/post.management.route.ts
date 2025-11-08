import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateRequestField } from 'core/middlewares/validations';
import { softValidateQuery } from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Tag from 'features/shared/tag/tag.model';
import File from 'features/shared/file/file.model';
import Post from 'features/shared/post/core/post.model';
import Game from 'features/shared/game/core/game.model';
import Category from 'features/shared/category/category.model';

// Controller
import PostManagementController from 'features/management/post/core/post.management.controller';

// DTO
import {
  CreatePostDto,
  PostManagementQueryDto,
  UpdatePostDto,
} from 'features/management/post/core/post.management.dto';

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
  validateBody(CreatePostDto),
  validateUniqueConflict(Post, 'slug'),
  validateRequestField(File, 'body', 'coverImage', '_id', {
    type: 'id',
    required: true,
  }),
  validateRequestField(Game, 'body', 'game', '_id', {
    type: 'id',
    required: true,
  }),
  validateRequestField(Tag, 'body', 'tags', '_id', {
    type: 'idArray',
    required: true,
  }),
  validateRequestField(Category, 'body', 'category', '_id', {
    type: 'id',
    required: true,
  }),
  postController.create,
]);

// <----------------   PATCH  ---------------->
postManagementRouter.patch('/:id', [
  validateBody(UpdatePostDto),
  validateObjectId(Post),
  validateUniqueConflict(Post, 'slug'),
  validateRequestField(File, 'body', 'coverImage', '_id', {
    type: 'id',
    required: false,
  }),
  validateRequestField(Game, 'body', 'game', '_id', {
    type: 'id',
    required: false,
  }),
  validateRequestField(Tag, 'body', 'tags', '_id', {
    type: 'idArray',
    required: false,
  }),
  validateRequestField(Category, 'body', 'category', '_id', {
    type: 'id',
    required: false,
  }),
  postController.update,
]);

export default postManagementRouter;

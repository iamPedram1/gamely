import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { validateRequestField } from 'core/middlewares/validations';
import { softValidateQuery } from 'core/middlewares/validateQuery';
import validateDocumentExistById from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Tag from 'features/shared/tag/tag.model';
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
import File from 'features/shared/file/file.model';
import { NotFoundError } from 'core/utilities/errors';

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
  validateRequestField(File, 'body', 'coverImage', '_id', {
    type: 'id',
    required: true,
    Error: NotFoundError,
  }),
  validateRequestField(Game, 'body', 'game', '_id', {
    type: 'id',
    required: true,
    Error: NotFoundError,
  }),
  validateRequestField(Tag, 'body', 'tags', '_id', {
    type: 'idArray',
    required: true,
    Error: NotFoundError,
  }),
  validateRequestField(Category, 'body', 'category', '_id', {
    type: 'id',
    required: true,
    Error: NotFoundError,
  }),
  postController.create,
]);

// <----------------   PATCH  ---------------->
postManagementRouter.patch('/:id', [
  validateBody(UpdatePostDto),
  validateDocumentExistById(Post),
  validateUniqueConflict(Post, 'slug'),
  validateRequestField(File, 'body', 'coverImage', '_id', {
    type: 'id',
    required: false,
    Error: NotFoundError,
  }),
  validateRequestField(Game, 'body', 'game', '_id', {
    type: 'id',
    required: false,
    Error: NotFoundError,
  }),
  validateRequestField(Tag, 'body', 'tags', '_id', {
    type: 'idArray',
    required: false,
    Error: NotFoundError,
  }),
  validateRequestField(Category, 'body', 'category', '_id', {
    type: 'id',
    required: false,
    Error: NotFoundError,
  }),
  postController.update,
]);

export default postManagementRouter;

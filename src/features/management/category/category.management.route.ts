import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateQuery from 'core/middlewares/validateQuery';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Category from 'features/shared/category/category.model';

// Controller
import CategoryManagementController from 'features/management/category/category.management.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'features/management/category/category.management.dto';

const categoryManagementRouter = express.Router();
const categoryController = container.resolve(CategoryManagementController);

categoryManagementRouter.use(auth(['author', 'admin', 'superAdmin']));

// <----------------   GET   ---------------->
categoryManagementRouter.get(
  '/',
  validateQuery(BaseQueryDto),
  categoryController.getAll
);
categoryManagementRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  categoryController.getAllSummaries
);
categoryManagementRouter.get(
  '/:id',
  validateObjectId(Category),
  categoryController.getOne
);

// <----------------   POST   ---------------->
categoryManagementRouter.post(
  '/',
  validateBody(CreateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.create
);

// <----------------   PATCH   ---------------->
categoryManagementRouter.patch(
  '/:id',
  validateObjectId(Category),
  validateBody(UpdateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.update
);

// <----------------   DELETE   ---------------->
categoryManagementRouter.delete(
  '/:id',
  validateObjectId(Category),
  categoryController.delete
);

export default categoryManagementRouter;

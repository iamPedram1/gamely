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

const categoryManagementnRouter = express.Router();
const categoryController = container.resolve(CategoryManagementController);

categoryManagementnRouter.use(auth(['author', 'admin']));

// <----------------   GET   ---------------->
categoryManagementnRouter.get(
  '/',
  validateQuery(BaseQueryDto),
  categoryController.getAll
);
categoryManagementnRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  categoryController.getAllSummaries
);
categoryManagementnRouter.get(
  '/:id',
  validateObjectId(Category),
  categoryController.getOne
);

// <----------------   POST   ---------------->
categoryManagementnRouter.post(
  '/',
  validateBody(CreateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.create
);

// <----------------   PATCH   ---------------->
categoryManagementnRouter.patch(
  '/:id',
  validateObjectId(Category),
  validateBody(UpdateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.update
);

// <----------------   DELETE   ---------------->
categoryManagementnRouter.delete(
  '/:id',
  validateObjectId(Category),
  categoryController.delete
);

export default categoryManagementnRouter;

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Category from 'api/category/category.model';

// Controller
import CategoryController from 'api/category/category.controller';

// Dto
import { BaseQueryDto } from 'dto/query';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'api/category/category.dto';

const categoryRouter = express.Router();
const categoryController = container.resolve(CategoryController);

// Public Routes
categoryRouter.get('/', validateQuery(BaseQueryDto), categoryController.getAll);
categoryRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  categoryController.getAllSummaries
);
categoryRouter.get('/nested', categoryController.getAllNested);
categoryRouter.get(
  '/:id',
  validateObjectId(Category),
  categoryController.getOne
);

// Protected Routes
categoryRouter.use(auth);
categoryRouter.post(
  '/',
  validateBody(CreateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.create
);
categoryRouter.patch(
  '/:id',
  validateObjectId(Category),
  validateBody(UpdateCategoryDto),
  validateUniqueConflict(Category, 'slug'),
  categoryController.update
);
categoryRouter.delete(
  '/:id',
  validateObjectId(Category),
  categoryController.delete
);

export default categoryRouter;

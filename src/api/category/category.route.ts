import express, { RequestHandler } from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Category from 'api/category/category.model';

// Controllers
import CategoryController from 'api/category/category.controller';

// Services
import CategoryService from 'api/category/category.service';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CategoryMapper } from 'api/category/category.mapper';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'api/category/category.dto';

const categoryRouter = express.Router();
const categoryMapper = new CategoryMapper();
const categoryService = new CategoryService();
const categoryController = new CategoryController(
  categoryService,
  categoryMapper
);

// Public Routes
categoryRouter.get('/', validateQuery(BaseQueryDto), categoryController.getAll);
categoryRouter.get('/nested', categoryController.getAllNested);
categoryRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  categoryController.getAllSummaries
);
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

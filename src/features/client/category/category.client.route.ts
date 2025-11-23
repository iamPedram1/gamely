import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import { validateParam } from 'core/middlewares/validations';

// Model
import Category from 'features/shared/category/category.model';

// Controller
import CategoryClientController from 'features/client/category/category.client.controller';

const categoryClientRouter = express.Router();
const categoryController = container.resolve(CategoryClientController);

// <----------------   GET   ---------------->
categoryClientRouter.get('/nested', categoryController.getAllNested);
categoryClientRouter.get(
  '/:slug',
  validateParam(Category, 'slug', 'slug'),
  categoryController.getOne
);

export default categoryClientRouter;

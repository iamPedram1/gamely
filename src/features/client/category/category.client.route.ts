import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import validateDocumentExistById from 'core/middlewares/validateObjectId';

// Model
import Category from 'features/shared/category/category.model';

// Controller
import CategoryClientController from 'features/client/category/category.client.controller';

const categoryClientRouter = express.Router();
const categoryController = container.resolve(CategoryClientController);

// <----------------   GET   ---------------->
categoryClientRouter.get('/nested', categoryController.getAllNested);
categoryClientRouter.get(
  '/:id',
  validateDocumentExistById(Category),
  categoryController.getOne
);

export default categoryClientRouter;

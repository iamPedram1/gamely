import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import { validateQuery } from 'core/middlewares/validateQuery';

// Model
import Tag from 'features/shared/tag/tag.model';

// Controller
import TagClientController from 'features/client/tag/tag.client.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { validateParam } from 'core/middlewares/validations';

const tagClientRouter = express.Router();
const tagController = container.resolve(TagClientController);

// <----------------   GET   ---------------->
tagClientRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagClientRouter.get(
  '/:slug',
  validateParam(Tag, 'slug', 'slug'),
  tagController.getOne
);

export default tagClientRouter;

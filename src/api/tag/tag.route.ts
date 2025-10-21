import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Controller
import TagController from 'api/tag/tag.controller';

// Dto
import { BaseQueryDto } from 'core/dto/query';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

const tagRouter = express.Router();
const tagController = container.resolve(TagController);

// Public Routes
tagRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  tagController.getAllSummaries
);
tagRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagRouter.get('/:id', validateObjectId(Tag), tagController.getOne);

// Protected Routes
tagRouter.use(auth(['user', 'admin']));
tagRouter.delete('/batch/delete', tagController.batchDelete);
tagRouter.delete('/:id', validateObjectId(Tag), tagController.delete);
tagRouter.post(
  '/',
  validateBody(CreateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.create
);
tagRouter.patch(
  '/:id',
  validateObjectId(Tag),
  validateBody(UpdateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.update
);

export default tagRouter;

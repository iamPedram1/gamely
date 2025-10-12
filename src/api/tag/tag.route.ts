import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateQuery from 'middleware/validateQuery';
import validateObjectId from 'middleware/validateObjectId';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Controller
import TagController from 'api/tag/tag.controller';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

const tagRouter = express.Router();
const tagController = container.resolve(TagController);

// Public Routes
tagRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  tagController.getAllSummaries
);
tagRouter.get('/:id', validateObjectId(Tag), tagController.getOne);

// Protected Routes
tagRouter.use(auth);
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

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';

// Model
import Tag from 'features/shared/tag/tag.model';

// Controller
import TagManagementController from 'features/management/tag/tag.management.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import {
  CreateTagDto,
  UpdateTagDto,
} from 'features/management/tag/tag.management.dto';

const tagManagementRouter = express.Router();
const tagController = container.resolve(TagManagementController);

tagManagementRouter.use(auth(['author', 'admin']));

// ----------------   GET   ----------------
tagManagementRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  tagController.getAllSummaries
);
tagManagementRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagManagementRouter.get('/:id', validateObjectId(Tag), tagController.getOne);

// ----------------   DELETE   ----------------
tagManagementRouter.delete('/batch/delete', tagController.batchDelete);
tagManagementRouter.delete('/:id', validateObjectId(Tag), tagController.delete);

// ----------------   POST   ----------------
tagManagementRouter.post(
  '/',
  validateBody(CreateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.create
);

// ----------------   PATCH  ----------------
tagManagementRouter.patch(
  '/:id',
  validateObjectId(Tag),
  validateBody(UpdateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.update
);

export default tagManagementRouter;

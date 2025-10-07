import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateQuery from 'middleware/validateQuery';
import validateObjectId from 'middleware/validateObjectId';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Controllers
import TagController from 'api/tag/tag.controller';

// Services
import TagService from 'api/tag/tag.service';

// Dto
import { BaseQueryDto } from 'dto/query';
import { TagMapper } from 'api/tag/tag.mapper';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

const tagRouter = express.Router();
const tagMapper = new TagMapper();
const tagService = new TagService();
const tagController = new TagController(tagService, tagMapper);

// Public Routes
tagRouter.get('/:id', validateObjectId(Tag), tagController.getOne);
tagRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagRouter.get(
  '/summaries',
  validateQuery(BaseQueryDto),
  tagController.getAllSummaries
);

// Protected Routes
tagRouter.use(auth);
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

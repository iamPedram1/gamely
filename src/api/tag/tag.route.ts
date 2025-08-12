import express from 'express';

// Midllewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Controllers
import TagController from 'api/tag/tag.controller';

// Services
import TagService from 'api/tag/tag.service';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';
import validateQuery from 'middleware/validateQuery';
import { BaseQueryDto } from 'dto/query';
import { TagMapper } from 'api/tag/tag.mapper';

const tagRouter = express.Router();
const tagMapper = new TagMapper();
const tagService = new TagService();
const tagController = new TagController(tagService, tagMapper);

tagRouter.post('/', [
  auth,
  validateBody(CreateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.create,
]);
tagRouter.get('/', [validateQuery(BaseQueryDto), tagController.getAll]);
tagRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  tagController.getAllSummaries,
]);
tagRouter.get('/:id', [validateObjectId(Tag), tagController.getOne]);
tagRouter.patch('/:id', [
  auth,
  validateObjectId(Tag),
  validateBody(UpdateTagDto),
  validateUniqueConflict(Tag, 'slug'),
  tagController.update,
]);
tagRouter.delete('/:id', [auth, validateObjectId(Tag), tagController.delete]);

export default tagRouter;

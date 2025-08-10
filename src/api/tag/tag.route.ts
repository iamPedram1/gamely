import express from 'express';

// Midllewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import { checkUniqueConflict } from 'middleware/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Controllers
import TagController from 'api/tag/tag.controller';

// Services
import TagService from 'api/tag/tag.service';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

const tagRouter = express.Router();
const tagService = new TagService();
const tagController = new TagController(tagService);

tagRouter.post('/', [auth, validateBody(CreateTagDto), tagController.create]);
tagRouter.get('/', [auth, tagController.getAll]);
tagRouter.get('/summaries', [auth, tagController.getAllSummaries]);
tagRouter.get('/:id', [auth, validateObjectId(Tag), tagController.getOne]);
tagRouter.patch('/:id', [
  auth,
  validateObjectId(Tag),
  validateBody(UpdateTagDto),
  checkUniqueConflict(Tag, 'slug'),
  tagController.update,
]);
tagRouter.delete('/:id', [auth, validateObjectId(Tag), tagController.delete]);

export default tagRouter;

import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateQuery from 'middleware/validateQuery';
import validateObjectId from 'middleware/validateObjectId';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Tag from 'api/tag/tag.model';

// Module
import createTagModule from 'api/tag/tag.module';

// Dto
import { BaseQueryDto } from 'dto/query';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

const tagRouter = express.Router();
const { tagController } = createTagModule();

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

/*
POST /auth/login
POST /auth/register
POST /auth/tags 
GET /tags 
GET /summaries
GET /tags/:id 
PATCH /tags/:id 
DELETE /tags/:id 
GET /categories 
GET /categories/summaries
GET /categories/:id 
PATCH /categories/:id 
DELETE /categories/:id 
GET /games 
GET /games/summaries
GET /games/:id 
PATCH /games/:id 
DELETE /games/:id 
GET /post 
GET /post/summaries
GET /post/:id 
PATCH /post/:id 
DELETE /post/:id 
*/

import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Tag from 'features/shared/tag/tag.model';

// Controller
import TagClientController from 'features/client/tag/tag.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';

const tagClientRouter = express.Router();
const tagController = container.resolve(TagClientController);

// ----------------   GET   ----------------
tagClientRouter.get('/', validateQuery(BaseQueryDto), tagController.getAll);
tagClientRouter.get('/:id', validateObjectId(Tag), tagController.getOne);

export default tagClientRouter;

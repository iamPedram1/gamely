import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import validateQuery from 'core/middlewares/validateQuery';
import validateObjectId from 'core/middlewares/validateObjectId';

// Model
import Post from 'features/shared/post/post.model';

// Controller
import PostClientController from 'features/client/post/post.client.controller';

// DTO
import { BaseQueryDto } from 'core/dto/query';

export const postClientRouter = express.Router();
const postController = container.resolve(PostClientController);

// ----------------   GET   ----------------
postClientRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postClientRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

export default postClientRouter;

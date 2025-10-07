import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import validateBody from 'middleware/validateBody';
import validateObjectId from 'middleware/validateObjectId';
import validateQuery from 'middleware/validateQuery';
import validateUniqueConflict from 'middleware/uniqueCheckerConflict';

// Model
import Post from 'api/post/post.model';

// Controllers
import PostController from 'api/post/post.controller';

// Services
import PostService from 'api/post/post.service';
import TagService from 'api/tag/tag.service';
import CategoryService from 'api/category/category.service';
import GameService from 'api/game/game.service';

// Dto
import { BaseQueryDto } from 'dto/query';
import { PostMapper } from 'api/post/post.mapper';
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

const postRouter = express.Router();
const postMapper = new PostMapper();
const tagService = new TagService();
const gameService = new GameService();
const categoryService = new CategoryService();
const postService = new PostService(tagService, gameService, categoryService);
const postController = new PostController(postService, postMapper);

// Public Routes
postRouter.get('/', [validateQuery(BaseQueryDto), postController.getAll]);
postRouter.get('/summaries', [
  validateQuery(BaseQueryDto),
  postController.getAllSummaries,
]);
postRouter.get('/:id', [validateObjectId(Post), postController.getOne]);

// Protected Routes
postRouter.use(auth);
postRouter.delete('/:id', [validateObjectId(Post), postController.delete]);
postRouter.post('/', [
  validateUniqueConflict(Post, 'slug'),
  validateBody(CreatePostDto),
  postController.create,
]);
postRouter.patch('/:id', [
  validateObjectId(Post),
  validateBody(UpdatePostDto),
  validateUniqueConflict(Post, 'slug'),
  postController.update,
]);

export default postRouter;

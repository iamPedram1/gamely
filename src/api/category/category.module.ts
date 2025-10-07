// Controllers
import CategoryController from 'api/category/category.controller';

// Services
import TagService from 'api/category/category.service';
import PostService from 'api/post/post.service';
import GameService from 'api/game/game.service';
import CategoryService from 'api/category/category.service';

// Dto
import { CategoryMapper } from 'api/category/category.mapper';

// Validation
import { PostValidation } from 'api/post/post.validation';

export default function createCategoryModule() {
  const categoryMapper = new CategoryMapper();
  const tagService = new TagService();
  const gameService = new GameService();
  const categoryService = new CategoryService();
  const postValidation = new PostValidation(
    tagService,
    gameService,
    categoryService
  );
  const postService = new PostService();
  postService.setDependencies({ postValidation });
  tagService.setDependencies({ postService });
  gameService.setDependencies({ postService });
  categoryService.setDependencies({ postService });

  const categoryController = new CategoryController(
    categoryService,
    categoryMapper
  );

  return { categoryController };
}

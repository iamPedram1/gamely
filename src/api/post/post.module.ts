// Controllers
import PostController from 'api/post/post.controller';

// Services
import TagService from 'api/tag/tag.service';
import PostService from 'api/post/post.service';
import GameService from 'api/game/game.service';
import CategoryService from 'api/category/category.service';

// Dto
import { PostMapper } from 'api/post/post.mapper';

// Validation
import { PostValidation } from 'api/post/post.validation';

export default function createPostModule() {
  const postMapper = new PostMapper();
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

  const postController = new PostController(postService, postMapper);
  return { postController };
}

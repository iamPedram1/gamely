// Controllers
import GameController from 'api/game/game.controller';

// Services
import TagService from 'api/tag/tag.service';
import PostService from 'api/post/post.service';
import GameService from 'api/game/game.service';
import CategoryService from 'api/category/category.service';

// Dto
import { GameMapper } from 'api/game/game.mapper';

// Validation
import { PostValidation } from 'api/post/post.validation';

export default function createGameModule() {
  const gameMapper = new GameMapper();
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

  const gameController = new GameController(gameService, gameMapper);
  return { gameController };
}

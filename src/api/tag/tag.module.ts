// Controllers
import TagController from 'api/tag/tag.controller';

// Services
import TagService from 'api/tag/tag.service';
import PostService from 'api/post/post.service';
import GameService from 'api/game/game.service';
import CommentService from 'api/comment/comment.service';
import CategoryService from 'api/category/category.service';

// Dto
import { TagMapper } from 'api/tag/tag.mapper';

// Validation
import { PostValidation } from 'api/post/post.validation';

export default function createTagModule() {
  const tagMapper = new TagMapper();
  const tagService = new TagService();
  const gameService = new GameService();
  const categoryService = new CategoryService();
  const commentService = new CommentService();
  const postValidation = new PostValidation(
    tagService,
    gameService,
    categoryService
  );
  const postService = new PostService();
  postService.setDependencies({ postValidation, commentService });
  tagService.setDependencies({ postService });
  gameService.setDependencies({ postService });
  categoryService.setDependencies({ postService });

  const tagController = new TagController(tagService, tagMapper);

  return { tagController };
}

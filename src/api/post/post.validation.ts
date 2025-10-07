// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type { ITagService } from 'api/tag/tag.service';
import type { IGameService } from 'api/game/game.service';
import type { ICategoryService } from 'api/category/category.service';

export class PostValidation {
  private tagService: ITagService;
  private gameService: IGameService;
  private categoryService: ICategoryService;

  constructor(
    tagService: ITagService,
    gameService: IGameService,
    categoryService: ICategoryService
  ) {
    this.tagService = tagService;
    this.gameService = gameService;
    this.categoryService = categoryService;
  }

  async validateCategory(category: string) {
    const exist = await this.categoryService.existsById(category);
    if (exist) return;
    else throw new ValidationError('Category with given id does not exist');
  }

  async validateGame(game: string) {
    if (!game) return;
    const exist = await this.gameService.existsById(game);
    if (!exist) throw new ValidationError('Game with given id does not exist');
  }

  async validateTags(tags: string[]) {
    if (!tags || tags.length === 0) return;

    const exist = await Promise.all(
      tags.map((tag) => this.tagService.existsById(tag))
    );
    exist.forEach((v, index) => {
      if (!v)
        throw new ValidationError(
          `Tag with given id (${tags[index]}) does not exist`
        );
    });
  }
}

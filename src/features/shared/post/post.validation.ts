import { delay, inject, injectable } from 'tsyringe';

// Utilities
import { NotFoundError } from 'core/utilites/errors';

// Services
import TagService from 'api/tag/tag.service';
import GameService from 'api/game/game.service';
import CategoryService from 'api/category/category.service';

@injectable()
export class PostValidation {
  constructor(
    @inject(delay(() => TagService)) private tagService: TagService,
    @inject(delay(() => GameService)) private gameService: GameService,
    @inject(delay(() => CategoryService))
    private categoryService: CategoryService
  ) {}

  async validateCategory(category: string) {
    const exist = await this.categoryService.existsById(category);
    if (exist) return;
    else throw new NotFoundError('Category with given id does not exist');
  }

  async validateGame(game: string) {
    if (!game) return;
    const exist = await this.gameService.existsById(game);
    if (!exist) throw new NotFoundError('Game with given id does not exist');
  }

  async validateTags(tags: string[]) {
    if (!tags || tags.length === 0) return;

    const exist = await Promise.all(
      tags.map((tag) => this.tagService.existsById(tag))
    );
    exist.forEach((v, index) => {
      if (!v)
        throw new NotFoundError(
          `Tag with given id (${tags[index]}) does not exist`
        );
    });
  }
}

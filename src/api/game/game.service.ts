import { DeleteResult } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import Game from 'api/game/game.model';

// Dto
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';

// Services
import PostService from 'api/post/post.service';
import BaseService from 'services/base.service.module';

// Types
import type { IGameEntity } from 'api/game/game.type';
import type { IApiBatchResponse } from 'utilites/response';

export type IGameService = InstanceType<typeof GameService>;

@injectable()
class GameService extends BaseService<
  IGameEntity,
  CreateGameDto,
  UpdateGameDto
> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService
  ) {
    super(Game);
  }

  async delete(id: string): Promise<DeleteResult> {
    await this.postService.updateManyByReference(id, 'game', null);

    return await this.deleteOneById(id);
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    await this.postService.updateManyByReferences(ids, 'game', null);

    return await super.batchDelete(ids);
  }
}

export default GameService;

import { DeleteResult } from 'mongoose';

// Models
import Game from 'api/game/game.model';

// Dto
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';

// Services
import BaseService, { IBaseService } from 'services/base';

// Types
import type { IGameEntity } from 'api/game/game.type';
import type { IPostService } from 'api/post/post.service';
import type { IApiBatchResponse } from 'utilites/response';

export interface IGameService
  extends IBaseService<IGameEntity, CreateGameDto, UpdateGameDto> {}

interface Dependencies {
  postService: IPostService;
}

class GameService
  extends BaseService<IGameEntity, CreateGameDto, UpdateGameDto>
  implements IGameService
{
  private postService: IPostService;

  constructor() {
    super(Game);
  }

  setDependencies({ postService }: Dependencies) {
    this.postService = postService;
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

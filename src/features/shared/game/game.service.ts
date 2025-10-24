import { delay, inject, injectable } from 'tsyringe';

// Models
import Game, { GameDocument } from 'features/shared/game/game.model';

// DTO
import {
  CreateGameDto,
  UpdateGameDto,
} from 'features/management/game/game.management.dto';

// Services
import PostService from 'features/shared/post/post.service';
import BaseService from 'core/services/base/base.service';

// Types
import type { IGameEntity } from 'features/shared/game/game.type';
import type { IApiBatchResponse } from 'core/utilites/response';
import type { BaseMutateOptions } from 'core/types/base.service.type';

export type IGameService = InstanceType<typeof GameService>;

@injectable()
class GameService extends BaseService<
  IGameEntity,
  CreateGameDto,
  UpdateGameDto,
  GameDocument
> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService
  ) {
    super(Game);
  }

  async deleteOneById(id: string): Promise<true> {
    await this.assertOwnership(id);
    await this.postService.updateManyByReference(id, 'game', null);
    return await super.deleteOneById(id);
  }

  async updateOneById<TThrowError extends boolean = true>(
    id: string,
    payload: Partial<UpdateGameDto>,
    options?:
      | (BaseMutateOptions<boolean> & { throwError?: TThrowError | undefined })
      | undefined
  ): Promise<TThrowError extends true ? GameDocument : GameDocument | null> {
    await this.assertOwnership(id);
    return super.updateOneById(id, payload, options);
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    await this.postService.updateManyByReferences(ids, 'game', null);

    return await super.batchDelete(ids, {
      ...(this.currentUser.isNot('admin') && {
        additionalFilter: { creator: this.currentUser.id },
      }),
    });
  }
}

export default GameService;

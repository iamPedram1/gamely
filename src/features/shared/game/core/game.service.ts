import { delay, inject, injectable } from 'tsyringe';

// Models
import Game from 'features/shared/game/core/game.model';

// DTO
import { UpdateGameDto } from 'features/management/game/game.management.dto';

// Services
import BaseService from 'core/services/base/base.service';
import PostService from 'features/shared/post/core/post.service';
import FavoriteGameService from 'features/shared/user/favoriteGame/favoriteGame.service';

// Types
import type { DocumentId } from 'core/types/common';
import type { IApiBatchResponse } from 'core/utilities/response';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type {
  GameDocument,
  GameLeanDocument,
  GameMetadata,
  IGameEntity,
} from 'features/shared/game/core/game.types';
import { UpdateQuery, Document, Types } from 'mongoose';

export type IGameService = InstanceType<typeof GameService>;

@injectable()
class GameService extends BaseService<IGameEntity, GameDocument> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService,
    @inject(delay(() => FavoriteGameService))
    private favoriteGameService: FavoriteGameService
  ) {
    super(Game);
  }

  async getGameById(id: DocumentId) {
    return await this.getOneById(id, { lean: true, populate: 'coverImage' });
  }

  async getGameBySlug(slug: string) {
    const game = (await this.getOneByKey('slug', slug, {
      lean: true,
      populate: 'coverImage',
    })) as GameLeanDocument & GameMetadata;

    if (this.softCurrentUser?.id) {
      game.isFavorite = await this.favoriteGameService.checkIsGameFavorited(
        this.currentUser.id,
        game._id
      );
    }

    return game;
  }

  async deleteOneById(id: string): Promise<true> {
    await this.assertOwnership(id);

    const [deleted] = await Promise.all([
      super.deleteOneById(id),
      this.postService.updateManyByReference(id, 'game', null),
      this.favoriteGameService.deleteManyByKey('game', id),
    ]);

    return deleted;
  }

  async updateOneById<TThrowError extends boolean = true>(
    id: DocumentId,
    payload: UpdateQuery<IGameEntity>,
    options?: BaseMutateOptions<boolean> & {
      throwError?: TThrowError | undefined;
      skipOwnershipCheck?: boolean;
    }
  ): Promise<TThrowError extends true ? GameDocument : GameDocument | null> {
    if (!options?.skipOwnershipCheck) await this.assertOwnership(String(id));

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

import { injectable } from 'tsyringe';

// Models
import FavoriteGame from 'features/shared/favoriteGame/favoriteGame.model';

// DTO
import { CreateFavoriteGameDto } from 'features/shared/favoriteGame/favoriteGame.dto';

// Services
import BaseService from 'core/services/base/base.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';
import type {
  IFavoriteGameEntity,
  FavoriteGameDocument,
} from 'features/shared/favoriteGame/favoriteGame.types';

export type IFavoriteGameService = InstanceType<typeof FavoriteGameService>;

@injectable()
class FavoriteGameService extends BaseService<IFavoriteGameEntity> {
  constructor() {
    super(FavoriteGame);
  }

  async favorite(gameId: string, options?: BaseMutateOptions): Promise<void> {
    const isGameFavorited = await this.checkIsGameFavorited(
      this.currentUser.id,
      gameId
    );

    if (isGameFavorited)
      throw new ValidationError(this.t('error.follow.already_following'));

    const favoriteGame = new CreateFavoriteGameDto();
    favoriteGame.user = this.currentUser.id;
    favoriteGame.game = gameId;

    this.create(favoriteGame, options);
  }

  async unfavorite(gameId: string, options?: BaseMutateOptions): Promise<void> {
    const favoriteGame = new CreateFavoriteGameDto();
    favoriteGame.user = this.currentUser.id;
    favoriteGame.game = gameId;

    const record = await this.getOneByCondition(favoriteGame, {
      throwError: false,
    });

    if (!record) return;

    await record?.deleteOne(options);
  }

  async getFavoriteGames<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    userId: DocumentId,
    options?:
      | (BaseQueryOptions<IFavoriteGameEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<
    FindResult<IFavoriteGameEntity, FavoriteGameDocument, TLean, TPaginate>
  > {
    return await this.find({
      lean: true,
      populate: [{ path: 'game', populate: 'coverImage' }],
      filter: { user: userId },
      select: 'createdAt game',
      ...options,
    });
  }

  async checkIsGameFavorited(userId: DocumentId, gameId: DocumentId) {
    if (userId === gameId) return false;
    return await this.existsByCondition({
      user: { $eq: userId },
      game: { $eq: gameId },
    });
  }
}

export default FavoriteGameService;

import { delay, inject, injectable } from 'tsyringe';

// Models
import GameService from 'features/shared/game/core/game.service';
import GameReview from 'features/shared/game/gameReview/gameReview.model';

// DTO
import {
  CreateGameReviewDto,
  UpdateGameReviewDto,
} from 'features/shared/game/gameReview/gameReview.dto';

// Services
import BaseService from 'core/services/base/base.service';

// Utilities
import { InternalServerError, ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type { GameDocument } from 'features/shared/game/core/game.types';
import type {
  GameReviewDocument,
  GameReviewEntity,
} from 'features/shared/game/gameReview/gameReview.types';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';

export type IFavoriteGameService = InstanceType<typeof FavoriteGameService>;

@injectable()
class FavoriteGameService extends BaseService<GameReviewEntity> {
  constructor(
    @inject(delay(() => GameService)) private gameService: GameService
  ) {
    super(GameReview);
  }

  async createReview(
    gameId: string,
    data: CreateGameReviewDto,
    options?: BaseMutateOptions
  ): Promise<GameReviewDocument> {
    const userId = this.currentUser.id;
    const isAlreadyReviewed = await this.checkIsAlreadyReviewed(userId, gameId);

    if (isAlreadyReviewed)
      throw new ValidationError(this.t('error.gameReview.already_reviewed'));

    return await this.withTransaction(async (session) => {
      const game = await this.gameService.getOneById(gameId);

      game.averageRate =
        (game.averageRate * game.totalRates + data.rate) /
        (game.totalRates + 1);
      game.totalRates += 1;

      const [review] = await Promise.all([
        this.create(
          { ...data, game: gameId, user: this.currentUser.id },
          { ...options, session }
        ),
        game.save({ session }),
      ]);
      return review;
    }, options?.session);
  }

  async updateReview(
    gameId: string,
    data: UpdateGameReviewDto,
    options?: BaseMutateOptions
  ): Promise<GameReviewDocument> {
    return await this.withTransaction(async (session) => {
      const review = await this.getReview(this.currentUser.id, gameId);
      const game = await this.gameService.getOneById(gameId);
      const oldRate = review.rate;
      this.setIfDefined(review, 'rate', data.rate);
      this.setIfDefined(review, 'description', data.description);
      const isRateModified = review.isModified('rate');

      if (isRateModified)
        game.averageRate =
          (game.averageRate * game.totalRates - oldRate + data.rate) /
          game.totalRates;

      const promises: [Promise<GameReviewDocument>, Promise<GameDocument>?] = [
        review.save({ session }),
      ];

      if (isRateModified) promises.push(game.save({ session }));

      const [updatedReview] = await Promise.all(promises);
      return updatedReview;
    }, options?.session);
  }

  async deleteReview(
    gameId: string,
    options?: BaseMutateOptions
  ): Promise<void> {
    await this.withTransaction(async (session) => {
      const [game, review] = await Promise.all([
        this.gameService.getOneById(gameId),
        this.getReview(this.currentUser.id, gameId),
      ]);

      game.averageRate =
        game.totalRates > 1
          ? (game.averageRate * game.totalRates - review.rate) /
            (game.totalRates - 1)
          : 0;
      game.totalRates -= 1;

      const [reviewDeleted] = await Promise.all([
        review.deleteOne({ ...options, session }),
        game.save({ ...options, session }),
      ]);

      if (reviewDeleted.deletedCount === 0) throw new InternalServerError();

      return reviewDeleted;
    }, options?.session);
  }

  async getGameReviews<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    gameId: string,
    options?: BaseQueryOptions<GameReviewEntity, boolean> & {
      lean?: TLean;
      paginate?: TPaginate;
    }
  ): Promise<FindResult<GameReviewEntity, TLean, TPaginate>> {
    return await this.find({
      filter: { game: gameId },
      lean: true,
      populate: [
        { path: 'game', populate: 'coverImage' },
        { path: 'user', populate: 'avatar' },
      ],
      ...options,
    });
  }

  private async checkIsAlreadyReviewed(userId: DocumentId, gameId: DocumentId) {
    return await this.existsByCondition({
      user: { $eq: userId },
      game: { $eq: gameId },
    });
  }
  private async getReview(userId: DocumentId, gameId: DocumentId) {
    return await this.getOneByCondition({
      user: { $eq: userId },
      game: { $eq: gameId },
    });
  }
}

export default FavoriteGameService;

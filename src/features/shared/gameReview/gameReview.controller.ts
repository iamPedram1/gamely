import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import GameReviewService from 'features/shared/gameReview/gameReview.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { GameReviewMapper } from 'features/shared/gameReview/gameReview.mapper';
import {
  CreateGameReviewDto,
  UpdateGameReviewDto,
} from 'features/shared/gameReview/gameReview.dto';

@injectable()
export default class GameReviewController {
  constructor(
    @inject(delay(() => GameReviewMapper))
    private gameReviewMapper: GameReviewMapper,
    @inject(delay(() => GameReviewService))
    private gameReviewService: GameReviewService
  ) {}

  getGameReviews: RequestHandler = async (req, res) => {
    const reviews = await this.gameReviewService.getGameReviews(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.GameReview.plural',
      body: {
        data: {
          pagination: reviews.pagination,
          docs: reviews.docs.map((doc) =>
            this.gameReviewMapper.toGameReviewDto(doc)
          ),
        },
      },
    });
  };

  createReview: RequestHandler = async (req, res) => {
    const dto = req.body as CreateGameReviewDto;
    const review = await this.gameReviewService.createReview(
      req.params.id,
      dto
    );

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.GameReview.singular',
      body: {
        data: this.gameReviewMapper.toGameReviewDto(review),
      },
    });
  };

  updateReview: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateGameReviewDto;
    const review = await this.gameReviewService.updateReview(
      req.params.id,
      dto
    );

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.GameReview.singular',
      body: {
        data: this.gameReviewMapper.toGameReviewDto(review),
      },
    });
  };

  deleteReview: RequestHandler = async (req, res) => {
    await this.gameReviewService.deleteReview(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.GameReview.singular',
    });
  };
}

import { container } from 'tsyringe';
import GameReviewService from 'features/shared/game/gameReview/gameReview.service';

export const generateGameReviewService = () =>
  container.resolve(GameReviewService);

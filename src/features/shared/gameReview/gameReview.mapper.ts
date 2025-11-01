import { singleton } from 'tsyringe';
import { AbstractMapper } from 'core/mappers/base';

// DTO
import { GameReviewResponseDto } from 'features/shared/gameReview/gameReview.dto';

// Types
import {
  GameReviewDocument,
  GameReviewLeanDocument,
} from 'features/shared/gameReview/gameReview.types';

export type IGameReviewMapper = InstanceType<typeof GameReviewMapper>;

@singleton()
export class GameReviewMapper extends AbstractMapper<
  GameReviewDocument,
  GameReviewLeanDocument
> {
  toGameReviewDto(doc: GameReviewLeanDocument) {
    return this.toInstance(GameReviewResponseDto, doc);
  }
}

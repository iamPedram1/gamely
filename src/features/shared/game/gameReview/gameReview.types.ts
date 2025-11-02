// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';
import type {
  GameDocument,
  GameLeanDocument,
} from 'features/shared/game/core/game.types';
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/core/user.types';

export type GameReviewDocument = HydratedDocument<GameReviewEntity>;
export type GameReviewLeanDocument = FlattenMaps<GameReviewEntity>;
export type GameReviewPopulatedDocument = GameReviewDocument & {
  user: UserDocument;
  game: GameDocument;
};
export type GameReviewPopulatedLeanDocument = GameReviewDocument & {
  user: UserLeanDocument;
  game: GameLeanDocument;
};

export interface GameReviewEntity {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  game: Types.ObjectId;
  rate: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

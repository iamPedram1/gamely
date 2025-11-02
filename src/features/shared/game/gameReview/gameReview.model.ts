import { GameReviewEntity } from 'features/shared/game/gameReview/gameReview.types';
import { model, Schema, Model } from 'mongoose';

// Types

const gameReviewSchema = new Schema<GameReviewEntity, Model<GameReviewEntity>>(
  {
    description: {
      type: String,
      minlength: 10,
      maxlength: 500,
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      immutable: true,
      index: true,
    },
  },
  { timestamps: true }
);

gameReviewSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export const GameReview = model<GameReviewEntity>(
  'GameReview',
  gameReviewSchema
);

export default GameReview;

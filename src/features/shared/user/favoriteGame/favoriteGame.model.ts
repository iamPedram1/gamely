import { model, Schema, Model } from 'mongoose';

// Types
import type { IFavoriteGameEntity } from 'features/shared/user/favoriteGame/favoriteGame.types';

const favoriteGameSchema = new Schema<
  IFavoriteGameEntity,
  Model<IFavoriteGameEntity>
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

favoriteGameSchema.index({ user: 1, game: 1 }, { unique: true });

export const FavoriteGame = model<IFavoriteGameEntity>(
  'FavoriteGame',
  favoriteGameSchema
);

export default FavoriteGame;

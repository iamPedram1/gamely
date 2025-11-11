import { model, Model, Schema } from 'mongoose';

// Types
import type { IGameEntity } from 'features/shared/game/core/game.types';

const translationSchema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 500,
      required: true,
    },
  },
  { _id: false }
);

const gameSchema = new Schema<IGameEntity, Model<IGameEntity>>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    translations: {
      en: { type: translationSchema, required: true },
      fa: { type: translationSchema, required: true },
    },
    slug: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
      required: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug is not valid'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    averageRate: {
      type: Number,
      default: 0,
      max: 5,
    },
    totalRates: {
      type: Number,
      default: 0,
    },
    coverImage: {
      default: null,
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

export const Game = model<IGameEntity>('Game', gameSchema);

export default Game;

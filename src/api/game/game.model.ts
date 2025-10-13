import { model, Model, FlattenMaps, HydratedDocument, Schema } from 'mongoose';

// Types
import type { IGameEntity } from 'api/game/game.type';

export type GameDocument = HydratedDocument<IGameEntity>;
export type GameLeanDocument = FlattenMaps<GameDocument>;

const gameSchema = new Schema<IGameEntity, Model<IGameEntity>>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 500,
      required: true,
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
    coverImage: {
      default: null,
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Game = model<IGameEntity>('Game', gameSchema);

export default Game;

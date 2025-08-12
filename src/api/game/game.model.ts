import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { IGameProps } from 'api/game/game.type';

export type GameDocument = HydratedDocument<IGameProps>;
export type GameLeanDocument = FlattenMaps<GameDocument>;

const gameSchema = new mongoose.Schema<IGameProps, mongoose.Model<IGameProps>>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
      required: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug is not valid'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Game = mongoose.model<IGameProps>('Game', gameSchema);

export default Game;

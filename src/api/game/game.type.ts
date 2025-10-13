import { Types } from 'mongoose';
import { GameResponseDto, GameSummaryResponseDto } from 'api/game/game.dto';

export interface IGameEntity extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  releaseDate: Date;
  coverImage: Types.ObjectId | null;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IGame = InstanceType<typeof GameResponseDto>;
export type IGameSummary = InstanceType<typeof GameSummaryResponseDto>;

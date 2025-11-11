import { HydratedDocument, FlattenMaps, Types } from 'mongoose';
import { WithDictionaries, WithTranslations } from 'core/types/translations';

export type GameDocument = HydratedDocument<IGameEntity>;
export type GameLeanDocument = FlattenMaps<IGameEntity>;
export interface GameMetadata {
  isFavorite?: boolean;
}

export interface GameTranslation {
  description: string;
}

export interface IGameEntity {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  translations: WithDictionaries<GameTranslation>;
  releaseDate: Date;
  creator: Types.ObjectId;
  coverImage: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  averageRate: number;
  totalRates: number;
}

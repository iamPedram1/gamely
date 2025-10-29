import { HydratedDocument, FlattenMaps, Types } from 'mongoose';
import { WithTranslations } from 'core/types/translations';

export type GameDocument = HydratedDocument<IGameEntity>;
export type GameLeanDocument = FlattenMaps<IGameEntity>;

export interface GameTranslation {
  title: string;
  description: string;
}

export interface IGameEntity extends WithTranslations<GameTranslation> {
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

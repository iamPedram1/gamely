// Types
import type { GameDocument } from 'features/shared/game/game.types';
import type { UserDocument } from 'features/shared/user/user.types';
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type FavoriteGameDocument = HydratedDocument<IFavoriteGameEntity>;
export type FavoriteGameLeanDocument = FlattenMaps<IFavoriteGameEntity>;
export type FavoriteGamePopulatedDocument = FavoriteGameDocument & {
  user: UserDocument;
  game: GameDocument;
};

export interface IFavoriteGameEntity {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  game: Types.ObjectId;
}

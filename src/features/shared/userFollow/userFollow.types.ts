// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type UserFollowDocument = HydratedDocument<IUserFollowEntity>;
export type UserFollowLeanDocument = FlattenMaps<IUserFollowEntity>;

export interface IUserFollowEntity {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  followed: Types.ObjectId;
}

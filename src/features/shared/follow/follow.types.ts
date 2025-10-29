// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type FollowDocument = HydratedDocument<IFollowEntity>;
export type FollowLeanDocument = FlattenMaps<IFollowEntity>;

export interface IFollowEntity {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  followed: Types.ObjectId;
}

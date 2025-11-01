// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type BlockDocument = HydratedDocument<IBlockEntity>;
export type BlockLeanDocument = FlattenMaps<IBlockEntity>;

export interface IBlockEntity {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  blocked: Types.ObjectId;
}

// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type BanDocument = HydratedDocument<IBanEntity>;
export type BanLeanDocument = FlattenMaps<IBanEntity>;

export type BanType = 'permanent' | 'temporary';
export type BanStatusType = 'active' | 'expired';

export interface IBanEntity {
  _id: Types.ObjectId;
  type: BanType;
  status: BanStatusType;
  user: Types.ObjectId;
  actor: Types.ObjectId;
  startAt: Date;
  endAt: Date | null;
  reason: string;
}

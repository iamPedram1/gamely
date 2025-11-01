// Types
import type { UserDocument } from 'features/shared/user/user.types';
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type ReportDocument = HydratedDocument<IReportEntity>;
export type ReportLeanDocument = FlattenMaps<IReportEntity>;
export type ReportPopulatedDocument<T> = ReportDocument & {
  user: UserDocument;
  target: T;
};

export type ReportType = 'comment' | 'post' | 'user';
export type ReportReasonType =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'violence'
  | 'other';

export type ReportStatusType =
  | 'pending'
  | 'reviewed'
  | 'resolved'
  | 'dismissed';

export interface IReportEntity {
  _id: Types.ObjectId;
  type: ReportType;
  status: ReportStatusType;
  reason: ReportReasonType;
  description: string;
  user: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
  targetId: Types.ObjectId;
}

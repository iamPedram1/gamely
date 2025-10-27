// Types
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<ICommentEntity>;
export type CommentLeanDocument = FlattenMaps<CommentDocument>;

export type CommentType = 'main' | 'reply';
export type CommentStatusType = 'approved' | 'rejected' | 'pending';

export interface ICommentEntity {
  _id: Types.ObjectId;
  type: CommentType;
  status: CommentStatusType;
  message: string;
  postId: Types.ObjectId;
  creator: Types.ObjectId;
  threadId?: Types.ObjectId | null;
  replyToCommentId?: Types.ObjectId | null;
  updatedAt: Date;
  createdAt: Date;
}

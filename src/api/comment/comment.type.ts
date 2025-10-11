// Types
import type { Types } from 'mongoose';

export type CommentType = 'main' | 'reply';

export interface ICommentEntity {
  _id: Types.ObjectId;
  type: CommentType;
  comment: string;
  postId: Types.ObjectId;
  creator: Types.ObjectId;
  threadId?: Types.ObjectId | null;
  replyToCommentId?: Types.ObjectId | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface IComment
  extends Omit<
    ICommentEntity,
    'postId' | 'replyToCommentId' | '_id' | 'createdAt'
  > {
  id: string;
  replies: IComment[];
  createdAt: string;
}

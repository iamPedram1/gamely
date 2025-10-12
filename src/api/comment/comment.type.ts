// Types
import type { Types } from 'mongoose';
import type {
  CommentResponseDto,
  CommentSummaryResponseDto,
} from 'api/comment/comment.dto';

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

export type IComment = InstanceType<typeof CommentResponseDto>;
export type ICommentSummary = InstanceType<typeof CommentSummaryResponseDto>;

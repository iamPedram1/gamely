import { model, Schema, Model, FlattenMaps, HydratedDocument } from 'mongoose';

// Constants
import {
  commentStatus,
  commentType,
} from 'features/shared/comment/comment.constants';

// Types
import type { ICommentEntity } from 'features/shared/comment/comment.type';

export type CommentDocument = HydratedDocument<ICommentEntity>;
export type CommentLeanDocument = FlattenMaps<CommentDocument>;

const commentSchema = new Schema<ICommentEntity, Model<ICommentEntity>>(
  {
    message: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 500,
      required: true,
    },
    type: {
      type: String,
      enum: commentType,
      default: 'main',
    },
    status: {
      type: String,
      enum: commentStatus,
      default: 'pending',
    },
    replyToCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      immutable: true,
      required: function () {
        return this.type === 'reply';
      },
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      immutable: true,
      required: function () {
        return this.type === 'reply';
      },
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      immutable: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

export const Comment = model<ICommentEntity>('Comment', commentSchema);

export default Comment;

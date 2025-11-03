import { model, Schema, Model } from 'mongoose';

// Constants
import { commentType } from 'features/shared/post/comment/comment.constant';

// Types
import type { ICommentEntity } from 'features/shared/post/comment/comment.types';

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
    replyToComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      immutable: true,
      required: function () {
        return this.type === 'reply';
      },
    },
    thread: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      immutable: true,
      required: function () {
        return this.type === 'reply';
      },
    },
    parentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
    post: {
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

import { model, Schema, Model, FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { ICommentEntity } from 'api/comment/comment.type';

export type CommentDocument = HydratedDocument<ICommentEntity>;
export type CommentLeanDocument = FlattenMaps<CommentDocument>;

const commentSchema = new Schema<ICommentEntity, Model<ICommentEntity>>(
  {
    comment: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 500,
      required: true,
    },
    type: {
      type: String,
      enum: ['main', 'reply'],
      default: 'main',
    },
    replyToCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: function () {
        return this.type === 'reply';
      },
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: function () {
        return this.type === 'reply';
      },
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Comment = model<ICommentEntity>('Comment', commentSchema);

export default Comment;

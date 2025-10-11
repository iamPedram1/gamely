import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { IPostEntity } from 'api/post/post.type';

export type PostDocument = HydratedDocument<IPostEntity>;
export type PostLeanDocument = FlattenMaps<PostDocument>;

const postSchema = new mongoose.Schema<
  IPostEntity,
  mongoose.Model<IPostEntity>
>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      minlength: 1,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
      required: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug is not valid'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
    },
    category: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPostEntity>('Post', postSchema);

export default Post;

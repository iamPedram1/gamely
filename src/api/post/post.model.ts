import {
  model,
  Model,
  FlattenMaps,
  HydratedDocument,
  Schema,
  Types,
} from 'mongoose';

// Types
import type { IPostEntity } from 'api/post/post.type';

export type PostDocument = HydratedDocument<IPostEntity>;
export type PostLeanDocument = FlattenMaps<PostDocument>;

const postSchema = new Schema<IPostEntity, Model<IPostEntity>>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    readingTime: {
      type: Number,
      min: 1,
      default: 1,
      required: true,
    },
    abstract: {
      type: String,
      trim: true,
      minlength: 1,
      maxLength: 150,
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
      index: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
      required: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug is not valid'],
    },
    creator: {
      index: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      index: true,
      default: null,
    },
    category: {
      index: true,
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    coverImage: {
      default: null,
      type: Types.ObjectId,
      ref: 'File',
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        index: true,
        ref: 'Tag',
      },
    ],
  },
  { timestamps: true }
);

export const Post = model<IPostEntity>('Post', postSchema);

export default Post;

import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { ITagProps } from 'api/tag/tag.type';

export type TagDocument = HydratedDocument<ITagProps>;
export type TagLeanDocument = FlattenMaps<ITagProps>;

const tagSchema = new mongoose.Schema<ITagProps, mongoose.Model<ITagProps>>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
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
  },
  { timestamps: true }
);

export const Tag = mongoose.model('Tag', tagSchema);

export default Tag;

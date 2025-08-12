import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { ITagEntity } from 'api/tag/tag.type';

export type TagDocument = HydratedDocument<ITagEntity>;
export type TagLeanDocument = FlattenMaps<TagDocument>;

const tagSchema = new mongoose.Schema<ITagEntity, mongoose.Model<ITagEntity>>(
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

export const Tag = mongoose.model<ITagEntity>('Tag', tagSchema);

export default Tag;

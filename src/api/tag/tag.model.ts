import { model, Schema, Model, FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { ITagEntity } from 'api/tag/tag.type';

export type TagDocument = HydratedDocument<ITagEntity>;
export type TagLeanDocument = FlattenMaps<TagDocument>;

const translationSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
  },
  { _id: false }
);

const tagSchema = new Schema<ITagEntity, Model<ITagEntity>>(
  {
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
    translations: {
      en: {
        type: translationSchema,
        required: true,
      },
      fa: {
        type: translationSchema,
        required: true,
      },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Tag = model<ITagEntity>('Tag', tagSchema);

export default Tag;

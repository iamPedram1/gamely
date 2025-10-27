import { model, Schema, Types, Model } from 'mongoose';

// Types
import type { ICategoryEntity } from 'features/shared/category/category.types';

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

const gameSchema = new Schema<ICategoryEntity, Model<ICategoryEntity>>(
  {
    translations: {
      en: { type: translationSchema, required: true },
      fa: { type: translationSchema, required: true },
    },
    slug: {
      type: String,
      index: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
      required: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug is not valid'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
      default: null,
      validate: {
        validator: (v) => v === null || Types.ObjectId.isValid(v),
        message: (props) => `${props.value} is not a valid ObjectId or null`,
      },
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

export const Category = model<ICategoryEntity>('Category', gameSchema);

export default Category;

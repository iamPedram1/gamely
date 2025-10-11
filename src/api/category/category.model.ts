import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';

// Types
import type { ICategoryEntity } from 'api/category/category.type';

export type CategoryDocument = HydratedDocument<ICategoryEntity>;
export type CategoryLeanDocument = FlattenMaps<CategoryDocument>;

const gameSchema = new mongoose.Schema<
  ICategoryEntity,
  mongoose.Model<ICategoryEntity>
>(
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
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
      default: null,
      validate: {
        validator: (v) => v === null || mongoose.Types.ObjectId.isValid(v),
        message: (props) => `${props.value} is not a valid ObjectId or null`,
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategoryEntity>('Category', gameSchema);

export default Category;

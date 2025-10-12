import {
  model,
  Schema,
  Types,
  Model,
  FlattenMaps,
  HydratedDocument,
} from 'mongoose';

// Types
import type { ICategoryEntity } from 'api/category/category.type';

export type CategoryDocument = HydratedDocument<ICategoryEntity>;
export type CategoryLeanDocument = FlattenMaps<CategoryDocument>;

const gameSchema = new Schema<ICategoryEntity, Model<ICategoryEntity>>(
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
    },
  },
  { timestamps: true }
);

export const Category = model<ICategoryEntity>('Category', gameSchema);

export default Category;

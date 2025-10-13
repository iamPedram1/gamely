import type { Types } from 'mongoose';
import type {
  CategoryResponseDto,
  CategorySummaryResponseDto,
  NestedCategoryResponseDto,
} from 'api/category/category.dto';

export interface ICategoryEntity extends Document {
  title: string;
  slug: string;
  parentId: Types.ObjectId | null;
  image: Types.ObjectId | null;
  creator: Types.ObjectId;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export type INestedCategoryEntity = ICategoryEntity & {
  children?: INestedCategoryEntity[];
};

export type ICategory = InstanceType<typeof CategoryResponseDto>;
export type ICategorySummary = InstanceType<typeof CategorySummaryResponseDto>;
export type INestedCategory = InstanceType<typeof NestedCategoryResponseDto>;

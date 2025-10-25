import { WithTranslations } from 'core/types/translations';
import type { Types } from 'mongoose';

export interface CategoryTranslation {
  title: string;
}

export interface ICategoryEntity extends WithTranslations<CategoryTranslation> {
  _id: Types.ObjectId;
  slug: string;
  parentId: Types.ObjectId | null;
  image: Types.ObjectId | null;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export type INestedCategoryEntity = ICategoryEntity & {
  children?: INestedCategoryEntity[];
};

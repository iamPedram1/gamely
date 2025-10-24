import { WithTranslations } from 'core/types/translations';
import { NestedCategoryClientResponseDto } from 'features/client/category/category.client.dto';
import type { Types } from 'mongoose';

export interface GameTranslation {
  title: string;
  description: string;
}

export interface ICategoryEntity extends WithTranslations<GameTranslation> {
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

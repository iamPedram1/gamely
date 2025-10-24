// Types
import type { Types } from 'mongoose';
import type { WithTranslations } from 'core/types/translations';

export interface TagTranslation {
  title: string;
}

export interface ITagEntity extends WithTranslations<TagTranslation> {
  slug: string;
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

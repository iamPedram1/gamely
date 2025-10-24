// Types
import type { Types } from 'mongoose';
import type { TagResponseDto, TagSummaryResponseDto } from 'api/tag/tag.dto';
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

export type ITag = InstanceType<typeof TagResponseDto>;
export type ITagSummary = InstanceType<typeof TagSummaryResponseDto>;

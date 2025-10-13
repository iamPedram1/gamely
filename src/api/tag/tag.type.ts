// Types
import type { Types } from 'mongoose';
import type { TagResponseDto, TagSummaryResponseDto } from 'api/tag/tag.dto';

export interface ITagEntity extends Document {
  title: string;
  slug: string;
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITag = InstanceType<typeof TagResponseDto>;
export type ITagSummary = InstanceType<typeof TagSummaryResponseDto>;

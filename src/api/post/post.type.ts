import type { Types } from 'mongoose';
import type {
  PostResponseDto,
  PostSummaryResponseDto,
} from 'api/post/post.dto';

export interface IPostEntity {
  title: string;
  slug: string;
  content: string;
  abstract: string;
  readingTime: number;
  _id: Types.ObjectId;
  tags: Types.ObjectId[];
  creator: Types.ObjectId;
  category: Types.ObjectId;
  coverImage: Types.ObjectId | null;
  game: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IPost = InstanceType<typeof PostResponseDto>;
export type IPostSummary = InstanceType<typeof PostSummaryResponseDto>;

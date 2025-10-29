import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';
import type { WithTranslations } from 'core/types/translations';
import type { PostManagementResponseDto } from 'features/management/post/post.management.dto';
import type {
  ClientPostSummaryResponseDto,
  ClientPostResponseDto,
} from 'features/client/post/post.client.dto';

export type PostDocument = HydratedDocument<IPostEntity>;
export type PostLeanDocument = FlattenMaps<IPostEntity>;

export interface PostTranslation {
  title: string;
  content: string;
  abstract: string;
}

export interface IPostEntity extends WithTranslations<PostTranslation> {
  slug: string;
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

export type IUserPost = InstanceType<typeof ClientPostResponseDto>;
export type IAdminPost = InstanceType<typeof PostManagementResponseDto>;
export type IPostSummary = InstanceType<typeof ClientPostSummaryResponseDto>;

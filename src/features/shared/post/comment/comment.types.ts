// Types
import { IPostEntity } from 'features/shared/post/core/post.types';
import { IUserEntity } from 'features/shared/user/core/user.types';
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<ICommentEntity>;
export type CommentLeanDocument = FlattenMaps<ICommentEntity>;

export type CommentType = 'main' | 'reply';

export interface ICommentEntity {
  _id: Types.ObjectId;
  type: CommentType;
  message: string;
  post: Types.ObjectId;
  parentIds: Types.ObjectId[];
  creator: Types.ObjectId;
  thread?: Types.ObjectId | null;
  replyToComment?: Types.ObjectId | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface ICommentPopulated
  extends Omit<ICommentEntity, 'creator' | 'post' | 'replyToComment'> {
  post: IPostEntity;
  replyToComment?: ICommentEntity & { creator: IUserEntity };
  creator: IUserEntity;
}

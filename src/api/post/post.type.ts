import type { Types } from 'mongoose';
import type { ITag } from 'api/tag/tag.type';
import type { IFileEntity } from 'types/file';
import type { IGame } from 'api/game/game.type';
import type { IUser } from 'api/user/user.types';
import type { ICategory } from 'api/category/category.type';

export interface IPostEntity {
  title: string;
  slug: string;
  content: string;
  abstract: string;
  tags: ITag[] | Types.ObjectId[];
  creator: IUser | Types.ObjectId;
  category: Types.ObjectId | ICategory;
  image: IFileEntity;
  game: IGame | Types.ObjectId | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPost extends IPostEntity {
  _id: string;
}

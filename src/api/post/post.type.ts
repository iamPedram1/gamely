import type { ICategory } from 'api/category/category.type';
import type { IGame } from 'api/game/game.type';
import type { ITag } from 'api/tag/tag.type';
import type { IUser } from 'api/user/user.types';
import IFileEntity from 'types/file';

export interface IPostEntity {
  title: string;
  slug: string;
  content: string;
  tags: ITag[] | string[];
  creator: IUser;
  category: string | ICategory;
  image: IFileEntity;
  game: IGame | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPost extends IPostEntity {
  _id: string;
}

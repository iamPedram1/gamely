import { Types } from 'mongoose';
import { IUser } from 'api/user/user.types';
import { IFileEntity } from 'types/file';

export interface ICategoryEntity {
  title: string;
  slug: string;
  parentId: Types.ObjectId | null;
  image: IFileEntity;
  creator: IUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory extends ICategoryEntity {
  _id: string;
}

export interface INestedCategory
  extends Omit<ICategory, 'creator' | 'updatedAt' | 'createdAt'> {
  children?: INestedCategory[];
}

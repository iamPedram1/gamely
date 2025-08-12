import type { IUser } from 'api/user/user.types';

export interface ITagEntity {
  title: string;
  slug: string;
  creator: IUser;
  createDate?: string;
  updateDate?: string;
}

export interface ITag extends ITagEntity {
  _id: string;
}

import { IUser } from 'api/user/user.types';
import IFileEntity from 'types/file';

export interface IGameEntity {
  title: string;
  slug: string;
  image: IFileEntity;
  creator: IUser;
  createDate?: string;
  updateDate?: string;
}

export interface IGame extends IGameEntity {
  _id: string;
}

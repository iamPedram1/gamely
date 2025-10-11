// Types
import type { IUser } from 'api/user/user.types';

export type IFileLocation = 'game' | 'post' | 'user';

export interface IFileEntity {
  _id: string;
  creator: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  location: IFileLocation;
  originalname: string;
  size: number;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
}

export interface IFile
  extends Omit<IFileEntity, '_id' | 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

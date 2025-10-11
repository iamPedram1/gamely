import { Types } from 'mongoose';

export interface IUserEntity {
  name: string;
  email: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
  _id: Types.ObjectId;
}

export interface IUser extends Omit<IUserEntity, '_id' | 'password'> {
  id: string;
}

export interface IUserEntity {
  name: string;
  email: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser extends IUserEntity {
  _id: string;
  id?: string;
}

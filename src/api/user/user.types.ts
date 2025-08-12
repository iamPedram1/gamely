export interface IUserEntity {
  name: string;
  email: string;
  password: string;
  createDate?: string;
  updateDate?: string;
}

export interface IUser extends IUserEntity {
  _id: string;
}

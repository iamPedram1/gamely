export interface IUserProps {
  name: string;
  email: string;
  password: string;
  createDate?: string;
  updateDate?: string;
}

export interface UserProps extends IUserProps {
  _id: string;
}

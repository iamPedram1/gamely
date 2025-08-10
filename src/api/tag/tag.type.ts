import { UserProps } from 'api/user/user.types';

export interface ITagProps {
  title: string;
  slug: string;
  creator: UserProps;
  createDate?: string;
  updateDate?: string;
}

export interface TagProps extends ITagProps {
  _id: string;
}

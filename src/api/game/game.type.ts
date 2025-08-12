import { UserProps } from 'api/user/user.types';
import FileProps from 'types/file';

export interface IGameProps {
  title: string;
  slug: string;
  image: FileProps;
  creator: UserProps;
  createDate?: string;
  updateDate?: string;
}

export interface GameProps extends IGameProps {
  _id: string;
}

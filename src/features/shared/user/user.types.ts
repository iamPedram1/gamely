import type { Types } from 'mongoose';
import type {
  UserResponseDto,
  UserSummaryResponseDto,
} from 'api/user/user.dto';

export type UserRole = 'user' | 'author' | 'admin';

export const UserRoleEnum: UserRole[] = ['user', 'author', 'admin'];

interface PrivateKeys {
  recoveryKey: string | null;
  refreshToken: string | null;
  password: string;
}

export interface IUserEntity extends PrivateKeys {
  _id: Types.ObjectId;
  role: UserRole;
  name: string;
  bio: string;
  email: string;
  avatar: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IUser = InstanceType<typeof UserResponseDto>;
export type IUserSummary = InstanceType<typeof UserSummaryResponseDto>;
export type IUserContext = Pick<IUser, 'id' | 'role' | 'name' | 'email'>;

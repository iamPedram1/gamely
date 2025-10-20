import { UserResponseDto, UserSummaryResponseDto } from 'api/user/user.dto';
import { Types } from 'mongoose';

export interface IUserEntity {
  _id: Types.ObjectId;
  token: string | null;
  recoveryKey: string | null;
  refreshToken: string | null;
  name: string;
  bio: string;
  email: string;
  password: string;
  avatar: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IUser = InstanceType<typeof UserResponseDto>;
export type IUserSummary = InstanceType<typeof UserSummaryResponseDto>;

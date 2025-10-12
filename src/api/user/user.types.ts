import { UserResponseDto, UserSummaryResponseDto } from 'api/user/user.dto';
import { Types } from 'mongoose';

export interface IUserEntity {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IUser = InstanceType<typeof UserResponseDto>;
export type IUserSummary = InstanceType<typeof UserSummaryResponseDto>;

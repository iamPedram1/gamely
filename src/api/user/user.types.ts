import { UserResponseDto, UserSummaryResponseDto } from 'api/user/user.dto';
import { Types } from 'mongoose';

export interface IUserEntity extends Document {
  _id: Types.ObjectId;
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

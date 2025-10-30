import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';
import type { UserManagementResponseDto } from 'features/management/user/user.management.dto';

export interface IUserEntityMethods {
  isBlocked: () => boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IRecoveryKey = { userId: string };
export type UserDocument = HydratedDocument<IUserEntity, IUserEntityMethods>;
export type UserLeanDocument = FlattenMaps<IUserEntity>;

export type UserRole = 'user' | 'author' | 'admin' | 'superAdmin';
export type UserStatus = 'active' | 'blocked';

interface PrivateKeys {
  recoveryKey: string | null;
  password: string;
}

export interface IUserEntity extends PrivateKeys {
  _id: Types.ObjectId;
  role: UserRole;
  username: string;
  bio: string;
  email: string;
  status: UserStatus;
  avatar: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  postsCount: number;
  blocksCount: number;
  followersCount: number;
  followingsCount: number;
}

export type IUser = InstanceType<typeof UserManagementResponseDto>;
export type IUserContext = Pick<
  IUser,
  'id' | 'role' | 'username' | 'email' | 'status'
> & { sessionId: string };

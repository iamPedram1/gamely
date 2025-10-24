import { IsIn, IsOptional, IsString } from 'class-validator';

// DTO
import { BaseUserUpdate } from 'features/shared/user/user.dto';

// Utilities
import { UserRoles } from 'features/shared/user/user.constants';

// Types
import type { Types } from 'mongoose';
import type { UserRole } from 'features/shared/user/user.types';

// <----------------   UPDATE   ---------------->
export class UpdateUserDto extends BaseUserUpdate {
  avatar: Types.ObjectId;
  bio: string;
  name: string;
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(UserRoles)
  role: UserRole;
}

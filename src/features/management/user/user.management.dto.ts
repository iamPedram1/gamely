import { Expose, Type } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

// DTO
import { BaseUserUpdate } from 'features/shared/user/user.dto';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Utilities
import { userRoles, userStatus } from 'features/shared/user/user.constants';

// Types
import type { Types } from 'mongoose';
import type { UserRole, UserStatus } from 'features/shared/user/user.types';

// <----------------   UPDATE   ---------------->
export class UpdateUserDto extends BaseUserUpdate {
  avatar: Types.ObjectId;
  bio: string;
  name: string;
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(userRoles)
  role: UserRole;

  @IsOptional()
  @IsString()
  @IsIn(userStatus)
  status: UserStatus;
}

// <----------------   RESPONSE   ---------------->
export class UserManagementResponseDto extends BaseResponseDto {
  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  bio: string;

  @Expose()
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  name: string;
}

export class UserManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  name: string;

  @Expose()
  bio: string;
}

import { Expose, Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'core/utilities/validation';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Utilities
import { userRoles } from 'features/shared/user/core/user.constant';

// Types
import type { Types } from 'mongoose';
import type { UserRole } from 'features/shared/user/core/user.types';

// <----------------   UPDATE   ---------------->
export class UpdateUserDto {
  @IsOptional()
  @IsMongoId()
  avatar: Types.ObjectId;

  @IsOptional()
  @Length(3, 255)
  bio: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  username: string;

  @IsOptional()
  @IsString()
  @IsIn(userRoles)
  role: UserRole;
}

// <----------------   RESPONSE   ---------------->
export class UserManagementResponseDto extends BaseResponseDto {
  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  bio: string;

  @Expose()
  isBanned: boolean;

  @Expose()
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  username: string;
}

export class UserManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  username: string;

  @Expose()
  bio: string;
}

// <----------------   QUERY   ---------------->

export class UserManagementQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(userRoles)
  role: UserRole;
}

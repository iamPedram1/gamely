import { Expose, Type } from 'class-transformer';

// DTO
import { BaseResponseDto } from 'core/dto/response';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseUserUpdate } from 'features/shared/user/core/user.dto';

// Utilities
import { usernameRegex } from 'features/shared/user/core/user.constant';
import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'core/utilities/validation';

// Types
import type { Types } from 'mongoose';
import type { UserRole } from 'features/shared/user/core/user.types';

// <----------------   UPDATE   ---------------->
export class UpdateProfileDto extends BaseUserUpdate {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  bio: string;

  @IsOptional()
  @IsString()
  @Matches(usernameRegex)
  @Length(3, 255)
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 255)
  password: string;

  @IsOptional()
  @IsMongoId()
  avatar: Types.ObjectId;

  @Expose()
  showLastSeen: number;
}

// <----------------   RESPONSE   ---------------->

export class UserBaseResponseDto extends BaseResponseDto {
  @Expose()
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  username: string;
}

export class UserProfileResponseDto extends UserBaseResponseDto {
  @Expose()
  role: UserRole;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  lastSeen: string | null;

  @Expose()
  isFollowing: boolean;

  @Expose()
  postsCount: number;

  @Expose()
  followingsCount: number;

  @Expose()
  followersCount: number;

  @Expose()
  blocksCount: number;
}

export class UserClientResponseDto extends UserBaseResponseDto {
  @Expose()
  lastSeen: string | null;

  @Expose()
  postsCount: number;

  @Expose()
  followingsCount: number;

  @Expose()
  followersCount: number;
}

export class UserClientSummaryResponseDto extends UserBaseResponseDto {}

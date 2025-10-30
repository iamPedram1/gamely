import { Expose, Type } from 'class-transformer';

// DTO
import { BaseUserUpdate } from 'features/shared/user/user.dto';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Utilities
import { usernameRegex } from 'features/shared/user/user.constants';
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
import type { UserRole } from 'features/shared/user/user.types';

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
}

// <----------------   RESPONSE   ---------------->

export class UserBaseResponseDto extends BaseResponseDto {
  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  lastSeen: string | null;

  @Expose()
  postsCount: number;

  @Expose()
  followingsCount: number;

  @Expose()
  followersCount: number;

  @Expose()
  isFollowing: boolean;

  @Expose()
  username: string;
}
export class UserProfileResponseDto extends UserBaseResponseDto {
  @Expose()
  role: UserRole;

  @Expose()
  blocksCount: number;
}

export class UserClientResponseDto extends UserBaseResponseDto {}

export class UserClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  username: string;
}

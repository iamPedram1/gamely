// DTO
import { Expose, Type } from 'class-transformer';
import { BaseUserUpdate } from 'features/shared/user/user.dto';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types
import type { Types } from 'mongoose';
import type { UserRole } from 'features/shared/user/user.types';

// <----------------   UPDATE   ---------------->
export class UpdateProfileDto extends BaseUserUpdate {
  bio: string;
  name: string;
  password: string;
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
  name: string;
}
export class UserProfileResponseDto extends UserBaseResponseDto {
  @Expose()
  role: UserRole;
}

export class UserClientResponseDto extends UserBaseResponseDto {}

export class UserClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  name: string;
}

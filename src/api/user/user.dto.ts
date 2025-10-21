import { Expose, Type } from 'class-transformer';
import {
  IsJWT,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

// Dto
import { FileResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types
import type { Types } from 'mongoose';
import type { IUserEntity, UserRole } from 'api/user/user.types';

export class UpdateProfileDto {
  constructor(data: Pick<IUserEntity, 'name' | 'avatar' | 'password' | 'bio'>) {
    Object.assign(this, data);
  }

  @IsOptional()
  @Length(3, 255)
  name: string;

  @IsOptional()
  @Length(1, 255)
  bio: string;

  @IsOptional()
  @Length(8, 255)
  password: string;

  @IsNotEmpty()
  @IsMongoId()
  avatar: Types.ObjectId;
}

export class RefreshTokenDto {
  constructor(data: Pick<IUserEntity, 'refreshToken'>) {
    Object.assign(this, data);
  }

  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}

export class UserResponseDto extends BaseResponseDto {
  constructor(data: Partial<IUserEntity>) {
    super();
    Object.assign(this, data);
  }

  @Expose()
  readonly email!: string;

  @Expose()
  readonly role!: UserRole;

  @Expose()
  readonly bio!: string;

  @Expose()
  @Type(() => FileResponseDto)
  readonly avatar!: FileResponseDto;

  @Expose()
  readonly name!: string;
}

export class UserSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly bio!: string;

  @Expose()
  @Type(() => FileResponseDto)
  readonly avatar!: FileResponseDto;
}

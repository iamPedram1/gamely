import { Expose, Type } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import { BaseQueryDto } from 'core/dto/query';
import { BaseSummaryResponseDto } from 'core/dto/response';
import {
  IsIn,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'core/utilities/validation';

import { banStatus, banType } from 'features/management/user/ban/ban.constant';
import {
  BanStatusType,
  BanType,
  IBanEntity,
} from 'features/management/user/ban/ban.types';
import { UserManagementResponseDto } from 'features/management/user/core/user.management.dto';

export class CreateBanDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(banType)
  type: BanType;

  @IsNotEmpty()
  @IsISO8601()
  startAt: string;

  @ValidateIf((obj: IBanEntity) => obj.type === 'temporary')
  @IsNotEmpty()
  @IsISO8601()
  endAt: string;
}

export class BanResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Type(() => UserManagementResponseDto)
  user: string;

  @Expose()
  @Type(() => UserManagementResponseDto)
  actor: string;

  @Expose()
  type: BanType;

  @Expose()
  status: BanStatusType;

  @Expose()
  startAt: Date;

  @Expose()
  reason: Date;

  @Expose()
  endAt: Date | null;
}

// <----------------   QUERY   ---------------->

export class BanManagementQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsMongoId({ each: true })
  actor: string | string[];

  @IsOptional()
  @IsMongoId({ each: true })
  user: string | string[];

  @IsOptional()
  @IsIn(banType)
  type: BanType;

  @IsOptional()
  @IsIn(banStatus)
  status: BanStatusType;
}

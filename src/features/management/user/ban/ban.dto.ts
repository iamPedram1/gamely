import { Expose, Type } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import { BaseSummaryResponseDto } from 'core/dto/response';
import {
  IsIn,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'core/utilities/validation';

import { banType } from 'features/management/user/ban/ban.constant';
import { BanType, IBanEntity } from 'features/management/user/ban/ban.types';
import { UserManagementResponseDto } from 'features/management/user/core/user.management.dto';

export class CreateBanDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

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
  startAt: Date;

  @Expose()
  endAt: Date | null;
}

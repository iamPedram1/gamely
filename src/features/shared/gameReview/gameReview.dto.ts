import { Expose, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { UserRole } from 'features/shared/user/user.types';
import { UserClientSummaryResponseDto } from 'features/client/user/user.client.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'core/utilities/validation';

// <----------------   CREATE   ---------------->
export class CreateGameReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description: string;
}

// <----------------   UPDATE   ---------------->
export class UpdateGameReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description: string;
}

// <----------------   RESPONSE   ---------------->

export class GameReviewResponseDto extends BaseSummaryResponseDto {
  @Expose()
  rate: number;

  @Expose()
  description: string;

  @Expose()
  @Type(() => UserClientSummaryResponseDto)
  user: UserClientSummaryResponseDto;
}

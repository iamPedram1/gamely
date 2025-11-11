import { Expose, Transform, Type } from 'class-transformer';

// DTO
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Utilities
import { pickLocaleField } from 'core/utilities/request-context';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

// Types
import type { IFileSummary } from 'features/shared/file/file.types';

export class GameClientResponseDto extends BaseResponseDto {
  @Expose()
  title: string;

  @Expose()
  @Transform(pickLocaleField('description'))
  description: string;

  @Expose()
  slug: string;

  @Expose()
  isFavorite?: boolean;

  @Expose()
  releaseDate: string;

  @Expose()
  averageRate: number;

  @Expose()
  totalRates: number;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => UserClientSummaryResponseDto)
  creator: UserClientSummaryResponseDto;
}

export class GameClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  slug!: string;
}

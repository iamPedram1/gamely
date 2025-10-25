import { Expose, Transform, Type } from 'class-transformer';

// DTO
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Utilities
import { pickLocaleField } from 'core/utilites/request-context';
import { UserClientSummaryResponseDto } from 'features/client/user/user.client.dto';

// Types
import type { IFileSummary } from 'features/shared/file/file.type';

export class GameClientResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  @Transform(pickLocaleField('description'))
  description: string;

  @Expose()
  slug: string;

  @Expose()
  releaseDate: string;

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

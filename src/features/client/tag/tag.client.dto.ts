import { Expose, Transform } from 'class-transformer';

// Utilities
import { pickLocaleField } from 'core/utilites/request-context';

// DTO
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// <----------------   RESPONSE   ---------------->
export class TagClientResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  slug: string;

  @Expose()
  postsCount: string;
}

export class TagClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  slug: string;
}

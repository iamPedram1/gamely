import { Expose, Transform, Type } from 'class-transformer';

// DTO
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { pickLocaleField } from 'core/utilities/request-context';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

// <----------------   RESPONSE   ---------------->
export class CategoryClientResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  @Type(() => UserClientSummaryResponseDto)
  creator: UserClientSummaryResponseDto;
}

export class NestedCategoryClientResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  @Type(() => NestedCategoryClientResponseDto)
  children!: NestedCategoryClientResponseDto[];
}

export class CategoryClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  slug!: string;
}

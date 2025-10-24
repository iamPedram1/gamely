import { Expose, Type } from 'class-transformer';

// DTO
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types

// <----------------   RESPONSE   ---------------->
export class CategoryClientResponseDto extends BaseResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class NestedCategoryClientResponseDto extends BaseSummaryResponseDto {
  @Expose()
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
  title!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  slug!: string;
}

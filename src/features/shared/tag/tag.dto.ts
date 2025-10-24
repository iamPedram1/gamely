import { Expose, Transform, Type } from 'class-transformer';

// DTO
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { pickLocaleField } from 'core/utilites/request-context';

export class TagResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  slug: string;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class TagClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  postsCount!: number;
}

import { Expose, Transform } from 'class-transformer';

// DTO
import { BaseResponseDto } from 'core/dto/response';
import { pickLocaleField } from 'core/utilites/request-context';

export class TagClientResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  slug: string;
}

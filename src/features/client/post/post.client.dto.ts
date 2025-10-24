import { Expose, plainToInstance, Transform, Type } from 'class-transformer';

// DTOs
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { pickLocaleField } from 'core/utilites/request-context';
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { CategorySummaryResponseDto } from 'api/category/category.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { TagClientSummaryResponseDto } from 'features/shared/tag/tag.dto';
import { GameClientResponseDto } from 'features/client/game/game.client.dto';

// Types
import type { IFileSummary } from 'api/file/file.type';

export class ClientPostResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;

  @Expose()
  readingTime: number;

  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;

  @Expose()
  @Transform(pickLocaleField('abstract'))
  abstract: string;

  @Expose()
  @Transform(pickLocaleField('content'))
  content: string;

  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserSummaryResponseDto, obj.creator, {
      excludeExtraneousValues: true,
    })
  )
  author: UserSummaryResponseDto;

  @Expose()
  @Type(() => GameClientResponseDto)
  game: GameClientResponseDto;

  @Expose()
  @Type(() => CategorySummaryResponseDto)
  category: CategorySummaryResponseDto;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => TagClientSummaryResponseDto)
  tags: TagClientSummaryResponseDto[];
}

export class ClientPostSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  slug: string;

  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;
}

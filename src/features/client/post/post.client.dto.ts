import { Expose, plainToInstance, Transform, Type } from 'class-transformer';

// Dtos
import { TagSummaryResponseDto } from 'api/tag/tag.dto';
import { GameResponseDto } from 'api/game/game.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { CategorySummaryResponseDto } from 'api/category/category.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { pickLocaleField } from 'core/utilites/request-context';

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
  @Type(() => GameResponseDto)
  game: GameResponseDto;

  @Expose()
  @Type(() => CategorySummaryResponseDto)
  category: CategorySummaryResponseDto;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => TagSummaryResponseDto)
  tags: TagSummaryResponseDto[];
}

export class ClientPostSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  slug: string;

  @Expose()
  @Transform(pickLocaleField('title'))
  title: string;
}

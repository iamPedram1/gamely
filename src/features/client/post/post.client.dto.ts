import { IsOptional, IsString } from 'core/utilities/validation';
import { Expose, plainToInstance, Transform, Type } from 'class-transformer';

// DTOs
import { BaseQueryDto } from 'core/dto/query';
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { GameClientResponseDto } from 'features/client/game/game.client.dto';
import { TagClientSummaryResponseDto } from 'features/client/tag/tag.client.dto';
import { UserClientSummaryResponseDto } from 'features/client/user/user.client.dto';
import { CategoryClientResponseDto } from 'features/client/category/category.client.dto';

// Utilities
import { pickLocaleField } from 'core/utilities/request-context';

// Types
import type { IFileSummary } from 'features/shared/file/file.types';

// <----------------   RESPONSE   ---------------->

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
    plainToInstance(UserClientSummaryResponseDto, obj.creator, {
      excludeExtraneousValues: true,
    })
  )
  author: UserClientSummaryResponseDto;

  @Expose()
  @Type(() => GameClientResponseDto)
  game: GameClientResponseDto;

  @Expose()
  @Type(() => CategoryClientResponseDto)
  category: CategoryClientResponseDto;

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

  @Expose()
  @Transform(pickLocaleField('abstract'))
  abstract: string;
}

// <----------------   QUERY   ---------------->
export class PostClientQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString({ each: true })
  tag: string | string[];

  @IsOptional()
  @IsString({ each: true })
  category: string | string[];

  @IsOptional()
  @IsString({ each: true })
  creator: string;

  @IsOptional()
  @IsString({ each: true })
  game: string;
}

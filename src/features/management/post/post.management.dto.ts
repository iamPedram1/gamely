import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
  IsNotEmptyObject,
} from 'class-validator';

// DTOs
import { BaseQueryDto } from 'core/dto/query';
import { BaseResponseDto } from 'core/dto/response';
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { GameManagementResponseDto } from 'features/management/game/game.management.dto';
import { TagManagementSummaryResponseDto } from 'features/management/tag/tag.management.dto';
import { UserManagementSummaryResponseDto } from 'features/management/user/user.management.dto';
import { CategoryManagementResponseDto } from 'features/management/category/category.management.dto';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

// Utilities
import { IsSlug } from 'core/utilites/validation';

// Types
import type { IFileSummary } from 'features/shared/file/file.type';
import type { PostTranslation } from 'features/shared/post/post.type';
import type { WithDictionaries } from 'core/types/translations';

// <----------------   CREATE   ---------------->
export class CreateTranslationDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 150)
  abstract: string;

  @IsNotEmpty()
  @IsString()
  @Length(1)
  content: string;
}

export class CreateTranslationsDto extends createTranslationsWrapper(
  CreateTranslationDto
) {}

export class CreatePostDto {
  @IsNotEmpty()
  @IsSlug()
  slug: string;

  @IsNotEmpty()
  @IsMongoId()
  coverImage: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readingTime: number;

  @IsNotEmpty()
  @IsMongoId()
  game: string;

  @IsNotEmpty()
  @IsMongoId({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmptyObject()
  @IsTranslationsField(CreateTranslationsDto)
  translations: CreateTranslationsDto;
}

// <----------------   UPDATE   ---------------->
export class UpdateTranslationDto {
  title: string;
  abstract: string;
  content: string;
}
export class UpdateTranslationsDto extends createTranslationsWrapper(
  UpdateTranslationDto
) {}

export class UpdatePostDto {
  @IsOptional()
  @IsSlug()
  slug: string;

  @IsOptional()
  @IsMongoId()
  coverImage: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readingTime: number;

  @IsOptional()
  @IsMongoId()
  game: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: string[];

  @IsOptional()
  @IsMongoId()
  category: string;

  @IsOptional()
  @IsTranslationsField(UpdateTranslationsDto)
  translations: UpdateTranslationsDto;
}

// <----------------   RESPONSE   ---------------->

export class BasePostResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;
}

export class PostManagementResponseDto extends BasePostResponseDto {
  @Expose()
  readingTime: number;

  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserManagementSummaryResponseDto, obj.creator, {
      excludeExtraneousValues: true,
    })
  )
  author: UserManagementSummaryResponseDto;

  @Expose()
  @Type(() => GameManagementResponseDto)
  game: GameManagementResponseDto;

  @Expose()
  @Type(() => CategoryManagementResponseDto)
  category: CategoryManagementResponseDto;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => TagManagementSummaryResponseDto)
  tags: TagManagementSummaryResponseDto[];

  @Expose()
  translations: WithDictionaries<PostTranslation>;
}

export class PostManagementSummaryResponseDto extends BasePostResponseDto {
  @Expose()
  translations: WithDictionaries<Pick<PostTranslation, 'title'>>;
}

// <----------------   QUERY   ---------------->

export class PostManagementQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsMongoId({ each: true })
  tag: string | string[];

  @IsOptional()
  @IsMongoId({ each: true })
  category: string | string[];

  @IsOptional()
  @IsMongoId({ each: true })
  creator: string;

  @IsOptional()
  @IsMongoId({ each: true })
  game: string;
}

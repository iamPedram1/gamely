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
import { BaseResponseDto } from 'core/dto/response';
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { TagManagementSummaryResponseDto } from 'features/management/tag/tag.management.dto';
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
import { GameManagementResponseDto } from 'features/management/game/game.management.dto';
import { CategoryManagementResponseDto } from 'features/management/category/category.management.dto';

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
    plainToInstance(UserSummaryResponseDto, obj.creator, {
      excludeExtraneousValues: true,
    })
  )
  author: UserSummaryResponseDto;

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

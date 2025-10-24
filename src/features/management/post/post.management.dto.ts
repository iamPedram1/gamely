import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsMongoId,
  IsNumber,
  Min,
  ValidateNested,
  IsNotEmptyObject,
  IsObject,
} from 'class-validator';

// DTOs
import { BaseResponseDto } from 'core/dto/response';
import { GameResponseDto } from 'api/game/game.dto';
import { TagSummaryResponseDto } from 'api/tag/tag.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { createTranslationsWrapper } from 'core/dto/translation';
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { CategorySummaryResponseDto } from 'api/category/category.dto';

// Types
import type { IFileSummary } from 'api/file/file.type';
import type { PostTranslation } from 'features/shared/post/post.type';
import type { WithDictionaries } from 'core/types/translations';

// ----------------   BASE   ----------------
abstract class BasePostMutateDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  abstract slug: string;

  @IsOptional()
  @IsMongoId()
  abstract coverImage: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  abstract readingTime: number;

  @IsOptional()
  @IsMongoId()
  abstract game: string;

  @IsOptional()
  @IsMongoId({ each: true })
  abstract tags: string[];

  @IsOptional()
  @IsMongoId()
  abstract category: string;
}

abstract class BaseTranslationDto {
  @IsString()
  @Length(3, 255)
  abstract title: string;

  @IsString()
  @Length(1, 150)
  abstract abstract: string;

  @IsString()
  @Length(1)
  abstract content: string;
}

// ----------------   CREATE   ----------------
export class CreateTranslationDto extends BaseTranslationDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  abstract: string;

  @IsNotEmpty()
  content: string;
}

export class CreateTranslationsDto extends createTranslationsWrapper(
  CreateTranslationDto
) {}

export class CreatePostDto extends BasePostMutateDto {
  @IsNotEmpty()
  category: string;
  @IsNotEmpty()
  coverImage: string;
  @IsNotEmpty()
  game: string;
  readingTime: number;
  @IsNotEmpty()
  slug: string;
  tags: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateTranslationsDto)
  @Transform(({ value }) => value || {})
  translations: CreateTranslationsDto;
}

// ----------------   UPDATE   ----------------
export class UpdateTranslationDto extends BaseTranslationDto {
  title: string;
  abstract: string;
  content: string;
}
export class UpdateTranslationsDto extends createTranslationsWrapper(
  UpdateTranslationDto
) {}

export class UpdatePostDto extends BasePostMutateDto {
  category: string;
  coverImage: string;
  game: string;
  readingTime: number;
  slug: string;
  tags: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateTranslationsDto)
  @Transform(({ value }) => value || {})
  translations: UpdateTranslationsDto;
}

// ----------------   RESPONSE   ----------------

export class BasePostResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;
}

export class AdminPostResponseDto extends BasePostResponseDto {
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

  @Expose()
  translations: WithDictionaries<PostTranslation>;
}

export class AdminPostSummaryResponseDto extends BasePostResponseDto {
  @Expose()
  translations: WithDictionaries<Pick<PostTranslation, 'title'>>;
}

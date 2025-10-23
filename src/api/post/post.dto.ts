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
  IsDefined,
  IsObject,
} from 'class-validator';

// Dtos
import { TagSummaryResponseDto } from 'api/tag/tag.dto';
import { GameResponseDto } from 'api/game/game.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { CategorySummaryResponseDto } from 'api/category/category.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types
import type { IFileSummary } from 'api/file/file.type';
import { i18nInstance } from 'core/utilites/request-context';

export class TranslationDto {
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

export class TranslationsDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TranslationDto)
  @Transform(({ value }) => value || {})
  en: TranslationDto;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslationDto)
  @Transform(({ value }) => value || {})
  fa: TranslationDto;
}

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;

  @IsNotEmpty()
  @IsMongoId()
  coverImage: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readingTime: number;

  @IsOptional()
  @IsMongoId()
  game: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslationsDto)
  @Transform(({ value }) => value || {})
  translations: TranslationsDto;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readingTime: number;

  @IsOptional()
  @IsMongoId()
  game: string;

  @IsOptional()
  @IsMongoId()
  coverImage: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: string[];

  @IsOptional()
  @IsMongoId()
  category: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDto)
  en: TranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDto)
  fa: TranslationDto;
}

export class PostResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;

  @Expose()
  readingTime: number;

  @Expose()
  @Transform(
    ({ obj }) => obj?.translations[i18nInstance().language].title || ''
  )
  title: string;

  @Expose()
  @Transform(
    ({ obj }) => obj?.translations[i18nInstance().language].abstract || ''
  )
  abstract: string;

  @Transform(
    ({ obj }) => obj?.translations[i18nInstance().language].content || ''
  )
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

export class PostSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  slug: string;

  @Expose()
  @Transform(
    ({ obj }) => obj?.translations[i18nInstance().language]?.title || ''
  )
  title: string;
}

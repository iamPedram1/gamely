import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
  IsISO8601,
  IsNotEmptyObject,
} from 'class-validator';

// DTO
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types
import type { IFileSummary } from 'api/file/file.type';
import { IsSlug } from 'core/utilites/validation';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

// ----------------   CREATE   ----------------
export class CreateTranslationDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  description: string;
}

export class CreateTranslationsDto extends createTranslationsWrapper(
  CreateTranslationDto
) {}

export class CreateGameDto {
  @IsNotEmptyObject()
  @IsTranslationsField(CreateTranslationsDto)
  translations: CreateTranslationsDto;

  @IsNotEmpty()
  @IsSlug()
  slug: string;

  @IsNotEmpty()
  @IsISO8601()
  releaseDate: string;

  @IsNotEmpty()
  @IsMongoId()
  coverImage: string | null;
}

// ----------------   UPDATE   ----------------
export class UpdateTranslationDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description: string;
}

export class UpdateTranslationsDto extends createTranslationsWrapper(
  UpdateTranslationDto
) {}

export class UpdateGameDto {
  @IsOptional()
  @IsSlug()
  slug: string;

  @IsOptional()
  @IsMongoId()
  coverImage: string | null;

  @IsOptional()
  @IsISO8601()
  releaseDate: string;

  @IsOptional()
  @IsTranslationsField(UpdateTranslationsDto)
  translations: UpdateTranslationsDto;
}

// ----------------   RESPONSE   ----------------
export class GameManagementResponseDto extends BaseResponseDto {
  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  releaseDate: string;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class GameManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

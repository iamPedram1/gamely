import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
  IsISO8601,
  IsNotEmptyObject,
} from 'core/utilities/validation';

// DTO
import { FileSummaryResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserManagementSummaryResponseDto } from 'features/management/user/user.management.dto';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

// Utilities
import { IsSlug } from 'core/utilities/validation';

// Types
import type { IFileSummary } from 'features/shared/file/file.types';
import { WithDictionaries } from 'core/types/translations';
import { GameTranslation } from 'features/shared/game/core/game.types';

// <----------------   CREATE   ---------------->
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

// <----------------   UPDATE   ---------------->
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

// <----------------   RESPONSE   ---------------->
export class GameManagementResponseDto extends BaseResponseDto {
  @Expose()
  translations: WithDictionaries<GameTranslation>;

  @Expose()
  slug: string;

  @Expose()
  releaseDate: string;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage: IFileSummary;

  @Expose()
  @Type(() => UserManagementSummaryResponseDto)
  creator: UserManagementSummaryResponseDto;
}

export class GameManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  translations: WithDictionaries<Pick<GameTranslation, 'title'>>;

  @Expose()
  slug!: string;
}

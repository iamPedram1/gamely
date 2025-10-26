import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsNotEmptyObject,
} from 'core/utilities/validation';

// DTO
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserManagementSummaryResponseDto } from 'features/management/user/user.management.dto';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

// Utilities
import { IsSlug } from 'core/utilities/validation';

// Types
import type { WithDictionaries } from 'core/types/translations';
import type { TagTranslation } from 'features/shared/tag/tag.type';

// <----------------   CREATE   ---------------->
export class CreateTranslationDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;
}

export class CreateTranslationsDto extends createTranslationsWrapper(
  CreateTranslationDto
) {}

export class CreateTagDto {
  @IsNotEmptyObject()
  @IsTranslationsField(CreateTranslationsDto)
  translations: CreateTranslationsDto;

  @IsNotEmpty()
  @IsSlug()
  slug: string;
}

// <----------------   UPDATE   ---------------->

export class UpdateTranslationDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;
}

export class UpdateTranslationsDto extends createTranslationsWrapper(
  UpdateTranslationDto
) {}

export class UpdateTagDto {
  @IsOptional()
  @IsSlug()
  slug: string;

  @IsOptional()
  @IsTranslationsField(UpdateTranslationsDto)
  translations: UpdateTranslationsDto;
}

// <----------------   RESPONSE   ---------------->

export class TagManagementResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;

  @Expose()
  @Type(() => UserManagementSummaryResponseDto)
  creator: UserManagementSummaryResponseDto;

  @Expose()
  translations: WithDictionaries<TagTranslation>;
}

export class TagManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  slug: string;

  @Expose()
  translations: WithDictionaries<TagTranslation>;

  @Expose()
  postsCount: number;
}

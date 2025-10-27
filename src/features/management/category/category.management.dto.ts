import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsMongoId,
  IsNotEmptyObject,
} from 'core/utilities/validation';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserManagementSummaryResponseDto } from 'features/management/user/user.management.dto';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

// Utilities
import { IsSlug } from 'core/utilities/validation';
import { WithDictionaries } from 'core/types/translations';
import { CategoryTranslation } from 'features/shared/category/category.type';

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

export class CreateCategoryDto {
  @IsNotEmptyObject()
  @IsTranslationsField(CreateTranslationsDto)
  translations: CreateTranslationsDto;

  @IsNotEmpty()
  @IsSlug()
  slug: string;

  @IsOptional()
  @IsMongoId()
  parentId: string | null;
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

export class UpdateCategoryDto {
  @IsOptional()
  @IsSlug()
  slug: string;

  @IsOptional()
  @IsTranslationsField(UpdateTranslationsDto)
  translations: UpdateTranslationsDto;

  @IsOptional()
  @IsMongoId()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  parentId: string;
}

// <----------------   RESPONSE   ---------------->

export class CategoryManagementResponseDto extends BaseResponseDto {
  @Expose()
  translations: WithDictionaries<CategoryTranslation>;

  @Expose()
  slug: string;

  @Expose()
  parentId: string | null;

  @Expose()
  @Type(() => UserManagementSummaryResponseDto)
  creator: UserManagementSummaryResponseDto;
}

export class CategoryManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  translations: WithDictionaries<CategoryTranslation>;

  @Expose()
  parentId: string | null;

  @Expose()
  slug: string;
}

// <----------------   QUERY   ---------------->

export class CategoryManagementQueryDto extends BaseQueryDto {}

import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsNotEmptyObject,
} from 'class-validator';

// DTO
import { UserSummaryResponseDto } from 'features/shared/user/user.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import {
  createTranslationsWrapper,
  IsTranslationsField,
} from 'core/dto/translation';

import type { WithDictionaries } from 'core/types/translations';
import type { TagTranslation } from 'features/shared/tag/tag.type';

// ----------------   BASE   ----------------
class BaseTranslationDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;
}

class BaseTagDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;
}

// ----------------   CREATE   ----------------
export class CreateTranslationDto extends BaseTranslationDto {
  @IsNotEmpty()
  declare title: string;
}

export class CreateTranslationsDto extends createTranslationsWrapper(
  CreateTranslationDto
) {}

export class CreateTagDto extends BaseTagDto {
  @IsNotEmptyObject()
  @IsTranslationsField(CreateTranslationsDto)
  translations: CreateTranslationsDto;
}

// ----------------   UPDATE   ----------------

export class UpdateTranslationDto extends BaseTranslationDto {
  declare title: string;
}

export class UpdateTranslationsDto extends createTranslationsWrapper(
  UpdateTranslationDto
) {}

export class UpdateTagDto extends BaseTagDto {
  @IsOptional()
  @IsTranslationsField(UpdateTranslationsDto)
  translations: UpdateTranslationsDto;
}

// ----------------   RESPONSE   ----------------

export class TagManagementResponseDto extends BaseResponseDto {
  @Expose()
  slug: string;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;

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

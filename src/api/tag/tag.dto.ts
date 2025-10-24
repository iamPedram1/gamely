import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsNotEmptyObject,
  ValidateNested,
  IsObject,
} from 'class-validator';

// Dto
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

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
  @IsObject()
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

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslationsDto)
  @Transform(({ value }) => value || {})
  translations: TranslationsDto;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;
}

export class TagResponseDto extends BaseResponseDto {
  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class TagSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  postsCount!: number;
}

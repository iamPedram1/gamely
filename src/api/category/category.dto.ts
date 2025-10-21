import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsMongoId,
} from 'class-validator';

// DTO
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

// Types
import type {
  ICategory,
  ICategoryEntity,
  INestedCategory,
} from 'api/category/category.type';

export class CreateCategoryDto {
  constructor(category?: Pick<ICategoryEntity, 'title' | 'slug'>) {
    Object.assign(this, category);
  }

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;

  @IsOptional()
  @IsMongoId()
  parentId: string | null;
}

export class UpdateCategoryDto {
  constructor(game?: Pick<ICategoryEntity, 'title' | 'slug'>) {
    Object.assign(this, game);
  }

  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsOptional()
  @IsMongoId()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  parentId: string;
}

export class CategoryResponseDto extends BaseResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class NestedCategoryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  @Type(() => NestedCategoryResponseDto)
  children!: INestedCategory[];
}

export class CategorySummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  @Type(() => CategorySummaryResponseDto)
  parentId!: ICategory | null;

  @Expose()
  slug!: string;
}

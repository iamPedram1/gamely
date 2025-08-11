import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

import { UserSummaryResponseDto } from 'api/user/user.dto';
import type { ITagProps } from 'api/tag/tag.type';

export class CreateTagDto {
  constructor(tag?: Pick<ITagProps, 'title' | 'slug'>) {
    Object.assign(this, tag);
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
}

export class UpdateTagDto {
  constructor(tag?: Pick<ITagProps, 'title' | 'slug'>) {
    Object.assign(this, tag);
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
}

export class TagResponseDto {
  @Expose()
  _id!: string;

  @Expose()
  title!: string;

  @Expose()
  createDate!: string;

  @Expose()
  updateDate!: string;

  @Expose()
  slug!: string;

  @Expose()
  creator: UserSummaryResponseDto;
}

export class TagSummaryResponseDto {
  @Expose()
  _id!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

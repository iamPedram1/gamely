import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

import { BaseResponseDto } from 'dto/response';
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { ITagEntity } from 'api/tag/tag.type';

export class CreateTagDto {
  constructor(tag?: Pick<ITagEntity, 'title' | 'slug'>) {
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
  constructor(tag?: Pick<ITagEntity, 'title' | 'slug'>) {
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

export class TagResponseDto extends BaseResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;
}

export class TagSummaryResponseDto extends BaseResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

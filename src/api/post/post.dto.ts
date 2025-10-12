import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsMongoId,
} from 'class-validator';

// Dto
import { TagResponseDto } from 'api/tag/tag.dto';
import { GameResponseDto } from 'api/game/game.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { CategoryResponseDto } from 'api/category/category.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';

// Types
import type { IPostEntity } from 'api/post/post.type';
import type { IFileSummary } from 'api/file/file.type';

export class CreatePostDto {
  constructor(post?: Pick<IPostEntity, 'title' | 'slug'>) {
    Object.assign(this, post);
  }

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
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;

  @IsNotEmpty()
  @IsString()
  @Length(1)
  content: string;

  @IsOptional()
  @IsMongoId()
  game: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsMongoId()
  category: string;
}

export class UpdatePostDto {
  constructor(post?: Pick<IPostEntity, 'title' | 'slug'>) {
    Object.assign(this, post);
  }

  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  abstract: string;

  @IsOptional()
  @IsString()
  @Length(3)
  content: string;

  @IsOptional()
  @IsString()
  @Length(1)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsOptional()
  @IsMongoId()
  game: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: string[];

  @IsOptional()
  @IsMongoId()
  category: string;
}

export class PostResponseDto extends BaseResponseDto {
  @Expose()
  title!: string;

  @Expose()
  abstract: string;

  @Expose()
  slug!: string;

  @Expose()
  @Type(() => UserSummaryResponseDto)
  creator: UserSummaryResponseDto;

  @Expose()
  @Type(() => GameResponseDto)
  game: GameResponseDto;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;

  @Expose()
  @Type(() => FileSummaryResponseDto)
  coverImage!: IFileSummary;

  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];
}

export class PostSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

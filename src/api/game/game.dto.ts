import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
  IsMongoId,
  IsISO8601,
} from 'class-validator';

// Dto
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { FileSummaryResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';

// Types
import type { IFileSummary } from 'api/file/file.type';
import type { IGameEntity } from 'api/game/game.type';

export class CreateGameDto {
  constructor(game?: Pick<IGameEntity, 'title' | 'slug'>) {
    Object.assign(this, game);
  }

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @IsISO8601()
  releaseDate: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  description: string;

  @IsOptional()
  @IsMongoId()
  coverImage: string | null;

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug is not valid' })
  slug: string;
}

export class UpdateGameDto {
  constructor(game?: Pick<IGameEntity, 'title' | 'slug'>) {
    Object.assign(this, game);
  }

  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;

  @IsOptional()
  @IsMongoId()
  coverImage: string | null;

  @IsOptional()
  @IsISO8601()
  releaseDate: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;
}

export class GameResponseDto extends BaseResponseDto {
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

export class GameSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

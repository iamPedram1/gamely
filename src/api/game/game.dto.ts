import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

import { UserSummaryResponseDto } from 'api/user/user.dto';
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
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;
}

export class GameResponseDto {
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

export class GameSummaryResponseDto {
  @Expose()
  _id!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;
}

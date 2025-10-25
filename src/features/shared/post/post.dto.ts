import { IsMongoId, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'core/dto/query';

export class PostQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsMongoId({ each: true })
  tag: string | string[];

  @IsOptional()
  @IsMongoId({ each: true })
  category: string | string[];

  @IsOptional()
  @IsMongoId({ each: true })
  creator: string;

  @IsOptional()
  @IsMongoId({ each: true })
  game: string;
}

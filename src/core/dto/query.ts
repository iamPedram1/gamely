import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsString,
  Length,
} from 'core/utilities/validation';

export class BaseQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['title', 'createdAt', '-createdAt'])
  sort?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  search?: string;
}

import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

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
  @IsIn(['title', 'createDate', '-createDate'])
  sort?: string;
}

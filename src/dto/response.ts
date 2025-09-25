import { Expose, Transform } from 'class-transformer';
import { IsISO8601, IsMongoId, IsNotEmpty } from 'class-validator';

export class BaseResponseDto {
  @Expose({ name: '_id' })
  @IsMongoId()
  @Transform(({ obj }) => String(obj._id))
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsISO8601()
  createdAt!: string;

  @Expose()
  @IsNotEmpty()
  @IsISO8601()
  updatedAt!: string;
}

export class BaseSummaryResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => String(obj._id))
  id: string;
}

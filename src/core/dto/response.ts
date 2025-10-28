import { Expose, Transform } from 'class-transformer';
import { IsMongoId } from 'core/utilities/validation';

export class BaseResponseDto {
  @Expose({ name: '_id' })
  @IsMongoId()
  @Transform(({ obj }) => String(obj._id))
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  createDate!: string;

  @Expose()
  @Transform(({ obj }) => obj.updatedAt)
  updateDate!: string;
}

export class BaseSummaryResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => String(obj._id))
  id: string;
}

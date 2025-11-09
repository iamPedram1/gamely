import { Expose, Transform } from 'class-transformer';
import { IsMongoId } from 'core/utilities/validation';

export class BaseResponseDto {
  @Expose({ name: '_id' })
  @IsMongoId()
  @Transform(({ obj }) => String(obj._id))
  id: string;

  @Expose({ name: 'createdAt' })
  createDate: string;

  @Expose()
  @Transform(({ obj }) => {
    if (!('updatedAt' in obj && 'createdAt' in obj)) return null;

    return obj.updatedAt.getTime() === obj.createdAt.getTime()
      ? null
      : obj.updatedAt;
  })
  updateDate: string;
}

export class BaseSummaryResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => String(obj._id))
  id: string;
}

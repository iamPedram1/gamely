import { Expose, Transform } from 'class-transformer';
import { appUrl } from 'core/utilites/configs';
import { IFileLocation } from 'api/file/file.type';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
export class FileResponseDto extends BaseResponseDto {
  @Expose()
  location: IFileLocation;

  @Expose()
  @Transform(({ obj }) => obj.originalname)
  filename: string;

  @Expose()
  size: number;

  @Expose()
  mimetype: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.path ? `${appUrl}/${obj.path}`.replace(/\\/g, '/') : null;
  })
  url: string | null;
}

export class FileSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.originalname)
  filename: string;

  @Expose()
  @Transform(({ obj }) => `${appUrl}/${obj.path}`.replace(/\\/g, '/'))
  url: string;
}

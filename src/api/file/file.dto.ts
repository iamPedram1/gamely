import { Expose, Transform } from 'class-transformer';
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';
import { IFileLocation } from 'api/file/file.type';
import { appUrl } from 'utilites/configs';

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
  @Transform(({ obj }) => `${appUrl}/${obj.path}`.replace(/\\/g, '/'))
  url: string;
}

export class FileSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.originalname)
  filename: string;

  @Expose()
  @Transform(({ obj }) => `${appUrl}/${obj.path}`.replace(/\\/g, '/'))
  url: string;
}

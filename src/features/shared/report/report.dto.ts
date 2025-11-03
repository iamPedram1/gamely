import { BaseQueryDto } from 'core/dto/query';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'core/utilities/validation';
import {
  reportReason,
  returnType,
} from 'features/shared/report/report.constant';
import {
  ReportReasonType,
  ReportType,
} from 'features/shared/report/report.types';

// <----------------   CREATE   ---------------->
export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(returnType)
  type: ReportType;

  @IsNotEmpty()
  @IsString()
  @IsIn(reportReason)
  reason: ReportReasonType;

  @IsNotEmpty()
  @IsMongoId()
  targetId: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description: string;
}

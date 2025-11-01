import type { Types } from 'mongoose';
import { Expose, Type } from 'class-transformer';

// Dto
import { BaseQueryDto } from 'core/dto/query';
import { BaseResponseDto } from 'core/dto/response';
import { CommentManagementResponseDto } from 'features/management/post/comment/comment.management.dto';
import { PostManagementResponseDto } from 'features/management/post/core/post.management.dto';
import { UserManagementResponseDto } from 'features/management/user/user.management.dto';

// Utilities
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'core/utilities/validation';
import {
  reportReason,
  reportStatus,
  returnType,
} from 'features/shared/report/report.constants';
import {
  ReportReasonType,
  ReportStatusType,
  ReportType,
} from 'features/shared/report/report.types';

// <----------------   UPDATE   ---------------->
export class UpdateReportDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(reportStatus)
  status: ReportStatusType;
}

// <----------------   RESPONSE   ---------------->
export class ReportManagementResponseDto extends BaseResponseDto {
  @Expose()
  type: ReportType;

  @Expose()
  status: ReportStatusType;

  @Expose()
  reason: ReportReasonType;

  @Expose()
  description: string;

  @Expose()
  @Type(() => UserManagementResponseDto)
  user: UserManagementResponseDto;

  @Expose()
  @Type(() => PostManagementResponseDto)
  post?: PostManagementResponseDto;

  @Expose()
  @Type((type) => {
    switch (type?.object.type as ReportType) {
      case 'comment':
        return CommentManagementResponseDto;
      case 'user':
        return UserManagementResponseDto;
      case 'post':
        return PostManagementResponseDto;
    }
  })
  target:
    | PostManagementResponseDto
    | CommentManagementResponseDto
    | UserManagementResponseDto;
}

// <----------------   QUERY   ---------------->
export class ReportManagementQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(returnType, { each: true })
  type: ReportType | ReportType[];

  @IsOptional()
  @IsString()
  @IsIn(reportReason)
  reason: ReportReasonType | ReportReasonType[];

  @IsOptional()
  @IsString()
  @IsIn(reportStatus)
  status: ReportStatusType | ReportStatusType[];

  @IsOptional()
  @IsMongoId()
  user: Types.ObjectId;
}

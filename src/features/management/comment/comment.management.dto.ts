import { Expose, Transform, Type } from 'class-transformer';
import { IsString, Length, IsOptional, IsIn } from 'class-validator';

// DTO
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserManagementResponseDto } from 'features/management/user/user.management.dto';

// Constants
import { commentStatus } from 'features/shared/comment/comment.constants';

// Types
import type { CommentStatusType } from 'features/shared/comment/comment.type';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @Length(10, 500)
  comment: string;

  @IsOptional()
  @IsString()
  @IsIn(commentStatus)
  status: CommentStatusType;
}

export class CommentManagementResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.comment)
  content: string;

  @Expose()
  @Type(() => UserManagementResponseDto)
  creator: UserManagementResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.creator.avatar)
  avatar: FileResponseDto;

  @Expose()
  status: CommentStatusType;

  @Expose()
  @Type(() => CommentManagementResponseDto)
  replies: CommentManagementResponseDto;
}

export class CommentManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.comment)
  content: string;
}

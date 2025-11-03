import { Expose, Transform, Type } from 'class-transformer';
import {
  IsString,
  Length,
  IsOptional,
  IsMongoId,
} from 'core/utilities/validation';

// DTO
import { BaseQueryDto } from 'core/dto/query';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserManagementResponseDto } from 'features/management/user/core/user.management.dto';
import { PostManagementSummaryResponseDto } from 'features/management/post/core/post.management.dto';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @Length(10, 500)
  message: string;
}

export class CommentManagementResponseDto extends BaseResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Type(() => UserManagementResponseDto)
  creator: UserManagementResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.creator.avatar)
  avatar: FileResponseDto;

  @Expose()
  @Type(() => CommentManagementResponseDto)
  replies: CommentManagementResponseDto;

  @Expose()
  @Type(() => PostManagementSummaryResponseDto)
  post: PostManagementSummaryResponseDto;
}

export class CommentManagementSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  message: string;
}

// <----------------   QUERY  ---------------->

export class CommentManagementQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsMongoId({ each: true })
  user: string;

  @IsOptional()
  @IsMongoId({ each: true })
  post: string;
}

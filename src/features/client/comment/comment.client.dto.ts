import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
  IsIn,
} from 'class-validator';

// DTO
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { commentStatus } from 'features/shared/comment/comment.constants';
import { CommentStatusType } from 'features/shared/comment/comment.type';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  comment: string;

  @IsOptional()
  @IsMongoId()
  replyToCommentId: string;
}

export class CommentClientResponseDto extends BaseResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.comment)
  content: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.name)
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.avatar)
  avatar: FileResponseDto;

  @Expose()
  @Type(() => CommentClientResponseDto)
  replies: CommentClientResponseDto;
}

export class CommentClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.comment)
  content: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.name)
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.avatar)
  avatar: FileResponseDto;

  @Expose()
  @Type(() => CommentClientSummaryResponseDto)
  replies: CommentClientSummaryResponseDto;
}

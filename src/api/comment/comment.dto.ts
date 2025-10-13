import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
} from 'class-validator';

// Dto
import { FileResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';

// Types
import type { ICommentEntity } from 'api/comment/comment.type';

export class CreateCommentDto {
  constructor(comment?: ICommentEntity) {
    Object.assign(this, comment);
  }

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  comment: string;

  @IsOptional()
  @IsMongoId()
  replyToCommentId: string;
}

export class UpdateCommentDto {
  constructor(
    comment?: Pick<
      ICommentEntity,
      'comment' | 'type' | 'postId' | 'replyToCommentId'
    >
  ) {
    Object.assign(this, comment);
  }

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  comment: string;

  @IsOptional()
  @IsMongoId()
  replyToCommentId: string;
}

export class CommentResponseDto extends BaseResponseDto {
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
  @Type(() => CommentResponseDto)
  replies!: CommentResponseDto;
}

export class CommentSummaryResponseDto extends BaseSummaryResponseDto {
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
  @Type(() => CommentSummaryResponseDto)
  replies!: CommentSummaryResponseDto;
}

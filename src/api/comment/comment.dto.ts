import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
} from 'class-validator';

// DTO
import { FileResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  comment: string;

  @IsOptional()
  @IsMongoId()
  replyToCommentId: string;
}

export class UpdateCommentDto {
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

import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
} from 'core/utilities/validation';

// DTO
import { FileResponseDto } from 'features/shared/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  message: string;

  @IsOptional()
  @IsMongoId()
  replyToCommentId: string;
}

export class CommentClientResponseDto extends BaseResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.username)
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
  message: string;

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

import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  ValidateIf,
  IsMongoId,
  IsEnum,
} from 'class-validator';

import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';
import { UserSummaryResponseDto } from 'api/user/user.dto';
import { ICommentEntity } from 'api/comment/comment.type';
import { IUser } from 'api/user/user.types';

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

  @IsOptional()
  @IsString()
  @Length(3, 255)
  title: string;
}

export class CommentResponseDto extends BaseResponseDto {
  @Expose()
  comment!: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.name)
  username: string;

  @Expose()
  @Type(() => CommentResponseDto)
  replies!: CommentResponseDto;
}

export class CommentSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  comment!: string;

  @Expose()
  @Transform(({ obj }) => obj.creator.name)
  username: string;

  @Expose()
  @Type(() => CommentSummaryResponseDto)
  replies!: CommentSummaryResponseDto;
}

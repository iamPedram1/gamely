import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsMongoId,
} from 'core/utilities/validation';

// DTO
import { BaseResponseDto, BaseSummaryResponseDto } from 'core/dto/response';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  message: string;

  @IsOptional()
  @IsMongoId()
  replyToComment?: string;
}

export class CommentClientResponseDto extends BaseResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserClientSummaryResponseDto, obj.creator)
  )
  user: UserClientSummaryResponseDto;

  @Expose()
  @Type(() => CommentClientResponseDto)
  replies: CommentClientResponseDto[];
}

export class CommentClientSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  message: string;

  @Transform(({ obj }) =>
    plainToInstance(UserClientSummaryResponseDto, obj.creator)
  )
  user: UserClientSummaryResponseDto;

  @Expose()
  @Type(() => CommentClientSummaryResponseDto)
  replies: CommentClientSummaryResponseDto[];
}

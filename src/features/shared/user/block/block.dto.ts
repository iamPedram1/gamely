import { Expose, Transform, plainToInstance } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import {
  UserClientResponseDto,
  UserClientSummaryResponseDto,
} from 'features/client/user/core/user.client.dto';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsMongoId()
  blocked: string;
}

export class BlockResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserClientSummaryResponseDto, obj.blocked)
  )
  user: UserClientSummaryResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  blockedAt: Date;
}

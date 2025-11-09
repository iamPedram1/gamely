import { Expose, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsMongoId()
  blocked: string;
}

export class BlockResponseDto extends BaseSummaryResponseDto {
  @Expose({ name: 'blocked' })
  @Type(() => UserClientSummaryResponseDto)
  user: UserClientSummaryResponseDto;

  @Expose({ name: 'createdAt' })
  blockedAt: Date;
}

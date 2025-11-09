import { Expose, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

export class CreateFavoriteGameDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;
  @IsNotEmpty()
  @IsMongoId()
  game: string;
}

export class FavoriteGameResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Type(() => UserClientSummaryResponseDto)
  user: UserClientSummaryResponseDto;

  @Expose()
  isFollowing: boolean;

  @Expose({ name: 'createdAt' })
  since: Date;

  @Expose()
  isBlocked: boolean;
}

export class FollowingResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Type(() => UserClientSummaryResponseDto)
  user: UserClientSummaryResponseDto;

  @Expose()
  isFollowing: boolean;

  @Expose({ name: 'createdAt' })
  since: Date;

  @Expose()
  isBlocked: boolean;
}

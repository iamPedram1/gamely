import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';

export class CreateFollowDto {
  @IsNotEmpty()
  @IsMongoId()
  follower: string;
  @IsNotEmpty()
  @IsMongoId()
  following: string;
}

export class FollowerResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserClientSummaryResponseDto, obj.follower)
  )
  user: UserClientSummaryResponseDto;

  @Expose()
  isFollowing: boolean;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  since: Date;

  @Expose()
  isBlocked: boolean;
}

export class FollowingResponseDto extends BaseSummaryResponseDto {
  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(UserClientSummaryResponseDto, obj.following)
  )
  user: UserClientSummaryResponseDto;

  @Expose()
  isFollowing: boolean;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  since: Date;

  @Expose()
  isBlocked: boolean;
}

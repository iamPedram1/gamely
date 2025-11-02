import { Expose, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { UserClientSummaryResponseDto } from 'features/client/user/core/user.client.dto';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { UserRole } from 'features/shared/user/core/user.types';

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

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
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

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  since: Date;

  @Expose()
  isBlocked: boolean;
}

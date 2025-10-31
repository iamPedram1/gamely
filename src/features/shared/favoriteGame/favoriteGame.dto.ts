import { Expose, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { UserRole } from 'features/shared/user/user.types';

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
  @Transform(({ obj }) => obj.user?.role)
  role: UserRole;

  @Expose()
  @Transform(({ obj }) => obj.user?.avatar)
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.user?.username)
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.user?._id)
  userId: string;

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
  @Transform(({ obj }) => obj.followed?.role)
  role: UserRole;

  @Expose()
  @Transform(({ obj }) => obj.followed?.avatar)
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.followed?.username)
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.followed?._id)
  userId: string;

  @Expose()
  isFollowing: boolean;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  since: Date;

  @Expose()
  isBlocked: boolean;
}

import { Expose, Transform, Type } from 'class-transformer';
import { BaseSummaryResponseDto } from 'core/dto/response';
import { IsMongoId, IsNotEmpty } from 'core/utilities/validation';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { UserRole } from 'features/shared/user/core/user.types';

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
  @Transform(({ obj }) => obj.blocked?.role)
  role: UserRole;

  @Expose()
  @Transform(({ obj }) => obj.blocked?.avatar)
  @Type(() => FileResponseDto)
  avatar: FileResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.blocked?.username)
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.blocked?._id)
  user: string;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  blockedAt: Date;
}

import { Expose, Type } from 'class-transformer';

// Dto
import { FileResponseDto } from 'api/file/file.dto';
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';

// Types
import type { IUserEntity } from 'api/user/user.types';

export class UserResponseDto extends BaseResponseDto {
  constructor(data: Partial<IUserEntity>) {
    super();
    Object.assign(this, data);
  }

  @Expose()
  readonly email!: string;

  @Expose()
  readonly bio!: string;

  @Expose()
  @Type(() => FileResponseDto)
  readonly avatar!: FileResponseDto;

  @Expose()
  readonly name!: string;
}

export class UserSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly bio!: string;

  @Expose()
  @Type(() => FileResponseDto)
  readonly avatar!: FileResponseDto;
}

import { Expose } from 'class-transformer';

// Dto
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
  readonly name!: string;
}

export class UserSummaryResponseDto extends BaseSummaryResponseDto {
  @Expose()
  readonly name!: string;
}

import { Expose } from 'class-transformer';

// Dto
import { BaseResponseDto, BaseSummaryResponseDto } from 'dto/response';

// Types
import type { IUser } from 'api/user/user.types';

export class UserResponseDto
  extends BaseResponseDto
  implements Omit<IUser, 'password' | '_id'>
{
  constructor(data: Partial<IUser>) {
    super();
    Object.assign(this, data);
  }

  @Expose()
  readonly email!: string;

  @Expose()
  readonly name!: string;
}

export class UserSummaryResponseDto
  extends BaseSummaryResponseDto
  implements Pick<IUser, 'name' | 'id'>
{
  @Expose()
  readonly name!: string;
}

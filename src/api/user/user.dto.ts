import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import type { IUser } from 'api/user/user.types';
import { BaseResponseDto } from 'dto/response';

export class UserResponseDto
  extends BaseResponseDto
  implements Omit<IUser, 'password' | '_id'>
{
  constructor(data: Partial<IUser>) {
    super();
    Object.assign(this, data);
  }

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}

export class UserSummaryResponseDto
  extends BaseResponseDto
  implements Pick<IUser, 'name' | 'id'>
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}

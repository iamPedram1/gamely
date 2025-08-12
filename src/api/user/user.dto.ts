import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsEmail,
  IsISO8601,
} from 'class-validator';
import type { IUser } from 'api/user/user.types';

class UserBaseDto implements Pick<IUser, '_id' | 'name'> {
  constructor(data: Partial<IUser>) {
    Object.assign(this, data);
  }

  @Expose()
  @IsNotEmpty()
  @IsMongoId()
  readonly _id!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}

export class UserResponseDto
  extends UserBaseDto
  implements Omit<IUser, 'password'>
{
  constructor(data: Partial<IUser>) {
    super(data);
    Object.assign(this, data);
  }

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @Expose()
  @IsNotEmpty()
  @IsISO8601()
  readonly createDate!: string;

  @Expose()
  @IsNotEmpty()
  @IsISO8601()
  readonly updateDate!: string;
}

export class UserSummaryResponseDto extends UserBaseDto {
  constructor(data: Partial<IUser>) {
    super(data);
    Object.assign(this, data);
  }
}

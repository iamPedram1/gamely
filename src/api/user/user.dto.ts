import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsEmail,
  IsISO8601,
} from 'class-validator';
import type { UserProps } from 'api/user/user.types';

class UserBaseDto implements Pick<UserProps, '_id' | 'name'> {
  constructor(data: Partial<UserProps>) {
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
  implements Omit<UserProps, 'password'>
{
  constructor(data: Partial<UserProps>) {
    super(data);
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
  constructor(data: Partial<UserProps>) {
    super(data);
  }
}

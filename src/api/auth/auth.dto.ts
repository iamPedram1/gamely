import * as validator from 'class-validator';
import type { IUser, IUserEntity } from 'api/user/user.types';

export class RegisterDto {
  constructor(user: IUserEntity) {
    this.name = user?.name || '';
    this.email = user?.email || '';
    this.password = user?.password || '';
  }

  @validator.IsNotEmpty()
  @validator.IsString()
  @validator.Length(3, 255)
  name: string;

  @validator.IsNotEmpty()
  @validator.IsEmail()
  email: string;

  @validator.IsNotEmpty()
  @validator.IsString()
  @validator.Length(8, 255)
  password: string;
}

export class LoginDto {
  constructor(user: Pick<IUserEntity, 'email' | 'password'>) {
    this.email = user?.email || '';
    this.password = user?.password || '';
  }

  @validator.IsNotEmpty()
  @validator.IsEmail()
  email: string;

  @validator.IsNotEmpty()
  @validator.IsString()
  @validator.Length(8, 255)
  password: string;
}

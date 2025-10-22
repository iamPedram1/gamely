import { IsEmail, IsJWT, IsNotEmpty, IsString, Length } from 'class-validator';
import type { IUserEntity } from 'api/user/user.types';

export class RecoverPasswordDto {
  constructor(user: IUserEntity) {
    Object.assign(this, user);
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  constructor(user: IUserEntity) {
    Object.assign(this, user);
  }

  @IsNotEmpty()
  @IsJWT()
  recoveryKey: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

export class RegisterDto {
  constructor(user: IUserEntity) {
    Object.assign(this, user);
  }

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

export class LoginDto {
  constructor(user: Pick<IUserEntity, 'email' | 'password'>) {
    Object.assign(this, user);
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

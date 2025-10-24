import { IsEmail, IsJWT, IsNotEmpty, IsString, Length } from 'class-validator';

export class RecoverPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsJWT()
  recoveryKey: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

export class RegisterDto {
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
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

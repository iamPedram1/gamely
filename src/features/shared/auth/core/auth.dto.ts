import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsJWT,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'core/utilities/validation';

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
  @Matches(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,255}$/)
  @Length(3, 255)
  username: string;

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

// <----------------   RESPONSE   ---------------->

export class BaseAuthResponseDto {
  @Expose()
  @IsJWT()
  refreshToken: string;

  @Expose()
  @IsJWT()
  accessToken: string;
}
export class RegisterResponseDto extends BaseAuthResponseDto {}

export class LoginResponseDto extends BaseAuthResponseDto {}

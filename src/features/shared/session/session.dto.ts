import {
  IsDate,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'core/utilities/validation';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}

export class RevokeTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  ip: string;

  @IsNotEmpty()
  @IsString()
  userAgent: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @IsNotEmpty()
  @IsDate()
  generatedAt: Date;

  @IsNotEmpty()
  @IsDate()
  lastActivity: Date;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  ip: string;

  @IsOptional()
  @IsString()
  userAgent: string;

  @IsOptional()
  @IsString()
  refreshToken: string;

  @IsOptional()
  userId: string;

  @IsOptional()
  @IsDate()
  expiresAt: Date;

  @IsOptional()
  @IsDate()
  generatedAt: Date;

  @IsOptional()
  @IsDate()
  lastActivity: Date;
}

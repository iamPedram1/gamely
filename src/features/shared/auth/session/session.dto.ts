import {
  IsDate,
  IsJWT,
  IsMongoId,
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
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @IsNotEmpty()
  @IsDate()
  generatedAt: Date;

  @IsOptional()
  @IsDate()
  refreshedAt: Date;

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
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsDate()
  expiresAt: Date;

  @IsOptional()
  @IsDate()
  refreshedAt: Date;

  @IsOptional()
  @IsDate()
  lastActivity: Date;
}

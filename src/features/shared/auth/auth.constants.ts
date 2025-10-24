import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const env = process.env;

// Secrets
export const fromEmail = env.FROM_Email as string;
export const emailApiKey = env.EMAIL_Api_Key as string;
export const jwtAccessTokenKey = env.JWT_AccessToken_Key as string;
export const jwtRefreshTokenKey = env.JWT_RefreshToken_Key as string;
export const jwtRecoverPasswordKey = env.JWT_RecoverPassword_Key as string;

// Expires
export const jwtRecoverPasswordKeyExpiresInMinutes = config.get(
  'JWT_RecoverPasswordKey_ExpiresInMinutes'
) as number;
export const jwtAccessTokenExpiresInMinutes = config.get(
  'JWT_AccessToken_ExpiresInMinutes'
) as number;
export const jwtRefreshTokenExpiresInDays = config.get(
  'JWT_RefreshToken_ExpiresInDays'
) as number;
export const jwtCookieExpiresInMinutes = config.get(
  'JWT_Cookie_ExpiresInMinuets'
) as number;

export const jwtTokenName = config.get('JWT_Token_Name') as string;
export const jwtRefreshTokenName = config.get(
  'JWT_RefreshToken_Name'
) as string;

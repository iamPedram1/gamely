import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const env = process.env;

export const jwtAccessTokenKey = env.JWT_AccessToken_Key as string;
export const jwtRefreshTokenKey = env.JWT_RefreshToken_Key as string;

export const jwtAccessTokenExpiresInMinutes = config.get(
  'JWT_AccessToken_ExpiresInMinutes'
) as number;
export const jwtRefreshTokenExpiresInDays = config.get(
  'JWT_RefreshToken_ExpiresInDays'
) as number;
export const jwtAccessTokenName = config.get('JWT_Token_Name') as string;
export const jwtRefreshTokenName = config.get(
  'JWT_RefreshToken_Name'
) as string;

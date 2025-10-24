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

// Configs
export const appPort = config.get('PORT') as number;
export const appDbUrl = config.get('DB') as string;
export const apiVersion = config.get('VERSION') as number;
export const appUrl = `http://localhost:${appPort}`;
export const prefixBaseUrl = (url: string) => `/api/v${apiVersion}${url}`;
export const prefixManagementBaseUrl = (url: string) =>
  `/api/v${apiVersion}/management${url}`;
export const userAppUrl = config.get('User_App_URL') as string;
export const jwtTokenName = config.get('JWT_Token_Name') as string;
export const jwtRefreshTokenName = config.get(
  'JWT_RefreshToken_Name'
) as string;

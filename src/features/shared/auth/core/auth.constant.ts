import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const env = process.env;

// Secrets
export const jwtRecoverPasswordKey = env.JWT_RecoverPassword_Key as string;

// Expires
export const jwtRecoverPasswordKeyExpiresInMinutes = config.get(
  'JWT_RecoverPasswordKey_ExpiresInMinutes'
) as number;
export const jwtCookieExpiresInMinutes = config.get(
  'JWT_Cookie_ExpiresInMinuets'
) as number;

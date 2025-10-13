import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const appPort = config.get('port') as number;
export const appDbUrl = config.get('db') as string;
export const apiVersion = config.get('version') as number;
export const appUrl = `http://localhost:${appPort}`;
export const prefixBaseUrl = (url: string) => `/api/v${apiVersion}${url}`;
export const jwtTokenName = config.get('jwtTokenName') as string;
export const jwtRefreshTokenName = config.get('jwtRefreshTokenName') as string;
export const jwtTokenKey = process.env.JwtTokenKey as string;
export const jwtTokenExpiresIn = config.get('jwtTokenExpiresIn') as string;
export const jwtRefreshTokenKey = process.env.JwtRefreshTokenKey as string;
export const jwtRefreshTokenExpiresIn = config.get(
  'jwtRefreshTokenExpiresIn'
) as string;
export const jwtCookieExpiresInMinuets = config.get(
  'jwtCookieExpiresInMinuets'
) as number;

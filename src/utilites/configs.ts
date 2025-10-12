import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const appPort = config.get('port') as number;
export const appDbUrl = config.get('db') as string;
export const apiVersion = config.get('version') as number;
export const appUrl = `http://localhost:${appPort}`;
export const prefixBaseUrl = (url: string) => `/api/v${apiVersion}${url}`;
export const jwtCookieName = config.get('jwtCookieName') as string;
export const jwtPrivateKey = process.env.JwtPrivateKey as string;
export const jwtTokenExpiresIn = config.get('jwtTokenExpiresIn') as string;
export const jwtCookieExpiresInSeconds = config.get(
  'jwtCookieExpiresInSeconds'
) as number;

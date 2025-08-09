import config from 'config';
import dotenv from 'dotenv';
dotenv.config();

export const appPort = config.get('port') as number;
export const appDbUrl = config.get('db') as string;
export const apiVersion = config.get('version') as number;
export const tokenHeaderName = config.get('tokenAuthName') as string;
export const prefixBaseUrl = (url: string) => `/api/v${apiVersion}${url}`;
export const jwtPrivateKey = process.env.JwtPrivateKey as string;

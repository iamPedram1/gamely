import config from 'config';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV;

// Configs
export const appPort = Number(config.get('PORT'));
export const appDbUrl = (
  NODE_ENV === 'production' ? process.env.MONGO_URI : config.get('DB')
) as string;
export const apiVersion = Number(config.get('VERSION'));
export const appUrl = `http://localhost:${appPort}`;
export const prefixBaseUrl = (url: string) => `/api/v${apiVersion}${url}`;
export const prefixManagementBaseUrl = (url: string) =>
  `/api/v${apiVersion}/management${url}`;
export const userAppUrl = config.get('User_App_URL') as string;

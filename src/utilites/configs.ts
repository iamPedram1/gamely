import config from 'config';

export const appPort = config.get('port') as string;
export const appDbUrl = config.get('db') as string;
export const apiVersion = config.get('version') as number;
export const prefixBaseUrl = (url: string) => `/api/${apiVersion}${url}`;

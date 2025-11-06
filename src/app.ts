import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config({ quiet: true });

// Startup
import dbStartup from 'core/startup/db';
import routesStartup from 'core/startup/routes';

// Utilities
import logger from 'core/utilities/logger';
import i18nStartup from 'core/startup/i18n';
import baseStartup from 'core/startup/base';

const app = express();

(async () => {
  await i18nStartup(app);
  if (process.env.NODE_ENV !== 'test') await dbStartup();
  baseStartup(app);
  routesStartup(app);
})();

process.on('unhandledRejection', (ex) => {
  logger.error(ex);
  throw ex;
});

process.on('uncaughtException', (ex) => {
  logger.error(ex);
  throw ex;
});

export default app;

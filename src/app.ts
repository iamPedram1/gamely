import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config({ quiet: true });

// Startup
import dbStartup from 'startup/db';
import routesStartup from 'startup/routes';

// Utilities
import logger from 'core/utilites/logger';
import i18nStartup from 'startup/i18n';
import baseStartup from 'startup/base';
import { appPort } from 'core/utilites/configs';

const app = express();

(async () => {
  dbStartup();
  await i18nStartup(app);
  baseStartup(app);
  routesStartup(app);
})();

const server = app.listen(appPort, () => {
  logger.info(`Listening on port ${appPort}`);
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

export default server;

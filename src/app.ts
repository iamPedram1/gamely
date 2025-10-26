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
import { appPort } from 'core/utilities/configs';

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

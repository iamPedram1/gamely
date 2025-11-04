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

const startApp = async () => {
  i18nStartup(app);
  baseStartup(app);
  routesStartup(app);
  await dbStartup();

  const server = app.listen(appPort, () => {
    logger.info(`Listening on port ${appPort}`);
  });

  return server;
};

export default startApp;

import 'reflect-metadata';

// Startup
import app from 'app';

// Utilities
import logger from 'core/utilities/logger';
import { appPort } from 'core/utilities/configs';

const server = app.listen(appPort, () => {
  logger.info(`Listening on port ${appPort}`);
});

process.on('unhandledRejection', (ex) => {
  logger.error(ex);
  throw ex;
});

process.on('uncaughtException', (ex) => {
  logger.error(ex);
  throw ex;
});

export default server;

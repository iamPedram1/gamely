import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import { appPort } from 'utilites/configs';
import logger from 'utilites/logger';
import morgan from 'morgan';
import dbStartup from 'startup/db';
import routesStartup from 'startup/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

dbStartup();
routesStartup(app);

const server = app.listen(appPort, () => {
  logger.info(`Listening on port ${appPort}`);
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

export default server;

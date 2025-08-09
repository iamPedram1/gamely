import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { appPort } from 'utilites/configs';
import logger from 'utilites/logger';
import morgan from 'morgan';
import dbStartup from 'startup/db';
import routesStartup from 'startup/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

dbStartup();
routesStartup(app);

app.listen(appPort, () => {
  logger.info(`Listening on port ${appPort}`);
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

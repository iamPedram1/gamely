// Third-party packages
import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import hpp from 'hpp';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
dotenv.config({ quiet: true });

// Startup
import dbStartup from 'startup/db';
import routesStartup from 'startup/routes';

// Utilities
import logger from 'utilites/logger';
import { appPort } from 'utilites/configs';
import baseStartup from 'startup/baseStartup';
import i18nStartup from 'startup/i18n';

const app = express();
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/', express.static(path.join(__dirname, '../public')));

// JSON
app.disable('etag');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));

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

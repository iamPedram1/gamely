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

const app = express();
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/', express.static(path.join(__dirname, '../public')));

// Headers
app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// JSON
app.disable('etag');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Sanitize
app.use((req, _res, next) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: req.query,
    writable: true,
  });

  next();
});

app.use(mongoSanitize());

// Paramater Polution
app.use(hpp());

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

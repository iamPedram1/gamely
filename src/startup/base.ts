import hpp from 'hpp';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { fileURLToPath } from 'url';
import type { Express } from 'express';

export default function baseStartup(app: Express) {
  // @ts-ignore
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.disable('etag');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use('/', express.static(path.join(__dirname, '../public')));

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );

  // JSON
  app.disable('etag');

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
}

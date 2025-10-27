import hpp from 'hpp';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import requestIp from 'request-ip';
import mongoSanitize from 'express-mongo-sanitize';
import type { Express } from 'express';

export default function baseStartup(app: Express) {
  app.disable('etag');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '10kb' }));
  const publicPath = path.resolve(process.cwd(), 'public');
  app.use('/', express.static(publicPath));
  app.set('query parser', 'extended');

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
  app.use(requestIp.mw());

  // Paramater Polution
  app.use(
    hpp({
      whitelist: ['tag', 'game', 'category', 'creator'],
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }
}

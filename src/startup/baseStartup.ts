import hpp from 'hpp';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import type { Express } from 'express';

export default function baseStartup(app: Express) {
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

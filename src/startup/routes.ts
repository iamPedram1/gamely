import { Express } from 'express';

// Routers
import tagRouter from 'api/tag/tag.route';
import authRouter from 'api/auth/auth.route';

// Middlewares
import error from 'middleware/error';
import notFound from 'middleware/notFound';

// Utilities
import { prefixBaseUrl } from 'utilites/configs';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/auth'), authRouter);
  app.use(prefixBaseUrl('/tags'), tagRouter);
  app.use(notFound);
  app.use(error);
}

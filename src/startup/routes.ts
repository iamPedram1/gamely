import { Express } from 'express';

// Middlewares
import error from 'middleware/error';
import notFound from 'middleware/notFound';
import { prefixBaseUrl } from 'utilites/configs';

export default function routesStartup(app: Express) {
  app.get(prefixBaseUrl('/auth/login'));
  app.get(prefixBaseUrl('/auth/register'));
  app.use(notFound);
  app.use(error);
}

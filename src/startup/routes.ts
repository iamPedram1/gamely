import { Express } from 'express';

// Routers

import tagRouter from 'api/tag/tag.route';
import authPublicRouter from 'features/client/auth/auth.client.route';
import fileRouter from 'api/file/file.route';
import gameRouter from 'api/game/game.route';
import userRouter from 'api/user/user.route';

import commentRouter from 'api/comment/comment.route';
import categoryRouter from 'api/category/category.route';
import postPublicRouter from 'features/client/post/post.client.route';
import postManagementRouter from 'features/management/post/post.management.route';

// Middlewares
import error from 'core/middlewares/error';
import notFound from 'core/middlewares/notFound';

// Utilities
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilites/configs';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/user'), userRouter);
  app.use(prefixBaseUrl('/auth'), authPublicRouter);
  app.use(prefixBaseUrl('/tags'), tagRouter);
  app.use(prefixBaseUrl('/games'), gameRouter);
  app.use(prefixBaseUrl('/categories'), categoryRouter);
  app.use(prefixBaseUrl('/posts'), postPublicRouter);
  app.use(prefixBaseUrl('/posts'), commentRouter);
  app.use(prefixBaseUrl('/upload'), fileRouter);

  // Management
  app.use(prefixManagementBaseUrl('/posts'), postManagementRouter);

  app.use(notFound);
  app.use(error);
}

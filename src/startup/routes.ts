import { Express } from 'express';

// Routers
import fileRouter from 'api/file/file.route';
import gameRouter from 'api/game/game.route';

// Client Routes
import commentRouter from 'api/comment/comment.route';
import categoryRouter from 'api/category/category.route';
import authClientRouter from 'features/client/auth/auth.client.route';
import postClientRouter from 'features/client/post/post.client.route';
import userClientRouter from 'features/client/user/user.client.route';

// Management Routes
import postManagementRouter from 'features/management/post/post.management.route';
import userManagementRouter from 'features/management/user/user.management.route';

// Middlewares
import error from 'core/middlewares/error';
import notFound from 'core/middlewares/notFound';

// Utilities
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilites/configs';
import tagClientRouter from 'features/client/tag/tag.route';
import tagManagementRouter from 'features/management/tag/tag.route';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/user'), userClientRouter);
  app.use(prefixBaseUrl('/auth'), authClientRouter);
  app.use(prefixBaseUrl('/tags'), tagClientRouter);
  app.use(prefixBaseUrl('/games'), gameRouter);
  app.use(prefixBaseUrl('/categories'), categoryRouter);
  app.use(prefixBaseUrl('/posts'), postClientRouter);
  app.use(prefixBaseUrl('/posts'), commentRouter);
  app.use(prefixBaseUrl('/upload'), fileRouter);

  // Management
  app.use(prefixManagementBaseUrl('/tags'), tagManagementRouter);
  app.use(prefixManagementBaseUrl('/posts'), postManagementRouter);
  app.use(prefixManagementBaseUrl('/users'), userManagementRouter);

  app.use(notFound);
  app.use(error);
}

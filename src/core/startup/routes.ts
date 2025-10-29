import { Express } from 'express';

// Routers
import fileRouter from 'features/shared/file/file.route';

// Client Routes
import tagClientRouter from 'features/client/tag/tag.client.route';
import gameClientRouter from 'features/client/game/game.client.route';
import authClientRouter from 'features/client/auth/auth.client.route';
import postClientRouter from 'features/client/post/post.client.route';
import userClientRouter from 'features/client/user/user.client.route';
import commentClientRouter from 'features/client/comment/comment.client.route';
import categoryClientRouter from 'features/client/category/category.client.route';
import notificationClientRouter from 'features/client/notification/notification.client.route';

// Management Routes
import gameManagementRouter from 'features/management/game/game.management.route';
import tagManagementRouter from 'features/management/tag/tag.management.route';
import postManagementRouter from 'features/management/post/post.management.route';
import userManagementRouter from 'features/management/user/user.management.route';
import commentManagementRouter from 'features/management/comment/comment.management.route';
import categoryManagementRouter from 'features/management/category/category.management.route';

// Middlewares
import error from 'core/middlewares/error';
import notFound from 'core/middlewares/notFound';

// Utilities
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilities/configs';
import userFollowRouter from 'features/shared/userFollow/userFollow.route';
import blockRouter from 'features/shared/block/block.route';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/upload'), fileRouter);
  app.use(prefixBaseUrl('/blockes'), blockRouter);
  app.use(prefixBaseUrl('/notifications'), notificationClientRouter);
  app.use(prefixBaseUrl('/user'), userClientRouter);
  app.use(prefixBaseUrl('/user'), userFollowRouter);
  app.use(prefixBaseUrl('/auth'), authClientRouter);
  app.use(prefixBaseUrl('/tags'), tagClientRouter);
  app.use(prefixBaseUrl('/games'), gameClientRouter);
  app.use(prefixBaseUrl('/posts'), postClientRouter);
  app.use(prefixBaseUrl('/posts'), commentClientRouter);
  app.use(prefixBaseUrl('/categories'), categoryClientRouter);

  // Management
  app.use(prefixManagementBaseUrl('/tags'), tagManagementRouter);
  app.use(prefixManagementBaseUrl('/posts'), postManagementRouter);
  app.use(prefixManagementBaseUrl('/comments'), commentManagementRouter);
  app.use(prefixManagementBaseUrl('/users'), userManagementRouter);
  app.use(prefixManagementBaseUrl('/games'), gameManagementRouter);
  app.use(prefixManagementBaseUrl('/categories'), categoryManagementRouter);

  app.use(notFound);
  app.use(error);
}

import { Express } from 'express';

// Routers
import fileRouter from 'features/shared/file/file.route';
import blockRouter from 'features/shared/block/block.route';
import followRouter from 'features/shared/follow/follow.route';
import favoriteGamePublicRouter from 'features/shared/favoriteGame/favoriteGame.route';

// Client Routes
import tagClientRouter from 'features/client/tag/tag.client.route';
import gameClientRouter from 'features/client/game/game.client.route';
import authClientRouter from 'features/client/auth/auth.client.route';
import postClientRouter from 'features/client/post/post.client.route';
import userClientRouter from 'features/client/user/user.client.route';
import reportClientRouter from 'features/client/report/report.client.route';
import commentClientRouter from 'features/client/comment/comment.client.route';
import categoryClientRouter from 'features/client/category/category.client.route';
import favoriteGamePrivateRouter from 'features/client/favoriteGames/favoriteGame.private.route';
import notificationClientRouter from 'features/client/notification/notification.client.route';

// Management Routes
import gameManagementRouter from 'features/management/game/game.management.route';
import tagManagementRouter from 'features/management/tag/tag.management.route';
import postManagementRouter from 'features/management/post/post.management.route';
import userManagementRouter from 'features/management/user/user.management.route';
import commentManagementRouter from 'features/management/comment/comment.management.route';
import categoryManagementRouter from 'features/management/category/category.management.route';
import reportManagementRouter from 'features/management/report/report.management.route';
import gameReviewRouter from 'features/shared/gameReview/gameReview.route';

// Middlewares
import error from 'core/middlewares/error';
import notFound from 'core/middlewares/notFound';

// Utilities
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilities/configs';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/upload'), fileRouter);
  app.use(prefixBaseUrl('/user/blocks'), blockRouter);
  app.use(prefixBaseUrl('/user/follows'), followRouter);
  app.use(prefixBaseUrl('/user/favorite-games'), favoriteGamePrivateRouter);
  app.use(
    prefixBaseUrl('/user/:username/favorite-games'),
    favoriteGamePublicRouter
  );
  app.use(prefixBaseUrl('/user/notifications'), notificationClientRouter);
  app.use(prefixBaseUrl('/user'), userClientRouter);
  app.use(prefixBaseUrl('/auth'), authClientRouter);
  app.use(prefixBaseUrl('/tags'), tagClientRouter);
  app.use(prefixBaseUrl('/reports'), reportClientRouter);
  app.use(prefixBaseUrl('/games/:id/reviews'), gameReviewRouter);
  app.use(prefixBaseUrl('/games'), gameClientRouter);
  app.use(prefixBaseUrl('/posts/:id/comments'), commentClientRouter);
  app.use(prefixBaseUrl('/posts'), postClientRouter);
  app.use(prefixBaseUrl('/categories'), categoryClientRouter);

  // Management
  app.use(prefixManagementBaseUrl('/tags'), tagManagementRouter);
  app.use(prefixManagementBaseUrl('/posts'), postManagementRouter);
  app.use(prefixManagementBaseUrl('/reports'), reportManagementRouter);
  app.use(prefixManagementBaseUrl('/comments'), commentManagementRouter);
  app.use(prefixManagementBaseUrl('/users'), userManagementRouter);
  app.use(prefixManagementBaseUrl('/games'), gameManagementRouter);
  app.use(prefixManagementBaseUrl('/categories'), categoryManagementRouter);

  app.use(notFound);
  app.use(error);
}

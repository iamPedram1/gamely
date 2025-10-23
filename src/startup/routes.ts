import { Express } from 'express';

// Routers
import tagRouter from 'api/tag/tag.route';
import authRouter from 'api/auth/auth.route';
import fileRouter from 'api/file/file.route';
import gameRouter from 'api/game/game.route';
import userRouter from 'api/user/user.route';
import commentRouter from 'api/comment/comment.route';
import categoryRouter from 'api/category/category.route';
import postUserRouter from 'api/post/routes/post.user.route';
import postAdminRouter from 'api/post/routes/post.admin.route';

// Middlewares
import error from 'core/middlewares/error';
import notFound from 'core/middlewares/notFound';

// Utilities
import { prefixBaseUrl } from 'core/utilites/configs';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/user'), userRouter);
  app.use(prefixBaseUrl('/auth'), authRouter);
  app.use(prefixBaseUrl('/tags'), tagRouter);
  app.use(prefixBaseUrl('/games'), gameRouter);
  app.use(prefixBaseUrl('/categories'), categoryRouter);
  app.use(prefixBaseUrl('/posts'), postUserRouter);
  app.use(prefixBaseUrl('/posts'), commentRouter);
  app.use(prefixBaseUrl('/upload'), fileRouter);

  // Protected Routes
  app.use(prefixBaseUrl('/management/posts'), postAdminRouter);

  app.use(notFound);
  app.use(error);
}

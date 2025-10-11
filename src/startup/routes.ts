import { Express } from 'express';

// Routers
import tagRouter from 'api/tag/tag.route';
import authRouter from 'api/auth/auth.route';
import gameRouter from 'api/game/game.route';
import commentRouter from 'api/comment/comment.route';
import categoryRouter from 'api/category/category.route';

// Middlewares
import error from 'middleware/error';
import notFound from 'middleware/notFound';

// Utilities
import { prefixBaseUrl } from 'utilites/configs';
import postRouter from 'api/post/post.route';

export default function routesStartup(app: Express) {
  app.use(prefixBaseUrl('/auth'), authRouter);
  app.use(prefixBaseUrl('/tags'), tagRouter);
  app.use(prefixBaseUrl('/games'), gameRouter);
  app.use(prefixBaseUrl('/categories'), categoryRouter);
  app.use(prefixBaseUrl('/posts'), commentRouter);
  app.use(prefixBaseUrl('/posts'), postRouter);
  app.use(notFound);
  app.use(error);
}

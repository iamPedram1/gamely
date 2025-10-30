import express from 'express';
import { container } from 'tsyringe';

// Controllers
import Notification from 'features/shared/notification/notification.model';
import NotificationClientController from 'features/client/notification/notification.controller';

// Middlewares
import auth from 'core/middlewares/auth';
import { validateParam } from 'core/middlewares/validations';
import { validateQuery } from 'core/middlewares/validateQuery';
import validateDocumentOwnership from 'core/middlewares/validateOwnership';

// DTO
import { BaseQueryDto } from 'core/dto/query';

const notificationClientRouter = express.Router();
const notificationClientController = container.resolve(
  NotificationClientController
);

notificationClientRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));

// <----------------   GET   ---------------->
notificationClientRouter.get(
  '/',
  validateQuery(BaseQueryDto),
  notificationClientController.getAll
);

// <----------------   POST   ---------------->
notificationClientRouter.post(
  '/seen/all',
  notificationClientController.seenAllNotification
);

notificationClientRouter.post(
  '/:id/seen',
  validateParam(Notification, 'id', '_id', { type: 'id' }),
  validateDocumentOwnership(Notification, 'id', 'receiverId', 'params'),
  notificationClientController.seenNotification
);

// <----------------   DELETE   ---------------->
notificationClientRouter.delete(
  '/delete/all',
  notificationClientController.deleteAllNotifications
);
notificationClientRouter.delete(
  '/:id',
  validateParam(Notification, 'id', '_id', { type: 'id' }),
  validateDocumentOwnership(Notification, 'id', 'receiverId', 'params'),
  notificationClientController.deleteNotification
);

export default notificationClientRouter;

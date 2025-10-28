import express from 'express';
import { container } from 'tsyringe';

// Controllers
import Notification from 'features/shared/notification/notification.model';
import NotificationClientController from 'features/client/notification/notification.controller';

// Middlewares
import auth from 'core/middlewares/auth';
import { validateParam } from 'core/middlewares/validateParams';
import validateDocumentOwnership from 'core/middlewares/validateOwnership';

// DTO

const notificationClientRouter = express.Router();
const notificationClientController = container.resolve(
  NotificationClientController
);

notificationClientRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));

notificationClientRouter.get('/', notificationClientController.getAll);

notificationClientRouter.post('/:id/seen', [
  validateParam(Notification, 'id', '_id', { type: 'id' }),
  validateDocumentOwnership(Notification, 'id', 'receiverId', 'params'),
  notificationClientController.seenNotification,
]);

export default notificationClientRouter;

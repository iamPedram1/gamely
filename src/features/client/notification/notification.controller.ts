import { delay, inject, injectable } from 'tsyringe';

// Services
import NotificationService from 'features/shared/notification/notification.service';

// Utilities
import sendResponse from 'core/utilities/response';

// Mapper
import { NotificationMapper } from 'features/shared/notification/notification.mapper';

// Types
import { BaseQueryDto } from 'core/dto/query';
import type { RequestHandler } from 'express';

@injectable()
export default class NotificationClientController {
  constructor(
    @inject(delay(() => NotificationService))
    private notificationService: NotificationService,
    @inject(delay(() => NotificationMapper))
    private notificationMapper: NotificationMapper
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as BaseQueryDto;

    const { docs, pagination } =
      await this.notificationService.getNotifications(query);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Notification.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.notificationMapper.toDto(doc)),
        },
      },
    });
  };

  seenNotification: RequestHandler = async (req, res) => {
    await this.notificationService.seenNotification(req.params.id);

    sendResponse(res, 204);
  };
  seenAllNotification: RequestHandler = async (req, res) => {
    await this.notificationService.seenAllNotifications();

    sendResponse(res, 204);
  };
  deleteNotification: RequestHandler = async (req, res) => {
    await this.notificationService.deleteNotification(req.params.id);

    sendResponse(res, 204);
  };
  deleteAllNotifications: RequestHandler = async (req, res) => {
    await this.notificationService.deleteAllNotifications();

    sendResponse(res, 204);
  };
}

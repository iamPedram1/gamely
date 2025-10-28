import { delay, inject, injectable } from 'tsyringe';

// Services
import NotificationService from 'features/shared/notification/notification.service';

// Utilities
import sendResponse from 'core/utilities/response';

// Mapper
import { NotificationMapper } from 'features/shared/notification/notification.mapper';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class NotificationClientController {
  constructor(
    @inject(delay(() => NotificationService))
    private notificationService: NotificationService,
    @inject(delay(() => NotificationMapper))
    private notificationMapper: NotificationMapper
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;

    const { docs, pagination } =
      await this.notificationService.getNotifications();

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
}

import { singleton } from 'tsyringe';

// DTO
import { AbstractMapper } from 'core/mappers/base';
import { NotificationResponseDto } from 'features/shared/user/notification/notification.dto';

// Types
import {
  NotificationDocument,
  NotificationLeanDocument,
} from 'features/shared/user/notification/notification.types';

export type INotificationMapper = InstanceType<typeof NotificationMapper>;

@singleton()
export class NotificationMapper extends AbstractMapper<
  NotificationDocument,
  NotificationLeanDocument
> {
  toDto(doc: NotificationLeanDocument) {
    return this.toInstance(NotificationResponseDto, doc);
  }
}

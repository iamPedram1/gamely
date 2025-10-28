import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// DTO
import { NotificationResponseDto } from 'features/shared/notification/notification.dto';

// Types
import { NotificationLeanDocument } from 'features/shared/notification/notification.types';

export type INotificationMapper = InstanceType<typeof NotificationMapper>;

@singleton()
export class NotificationMapper {
  toDto(doc: NotificationLeanDocument) {
    return plainToInstance(NotificationResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}

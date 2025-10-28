import { Expose, Type } from 'class-transformer';
import { modelKeyName } from 'core/utilities/common';
import { notificationType } from 'features/shared/notification/notification.constants';
import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'core/utilities/validation';

// Dto
import { BaseResponseDto } from 'core/dto/response';
import { ClientPostSummaryResponseDto } from 'features/client/post/post.client.dto';

// Types
import type { Types } from 'mongoose';
import type { ModelKeys } from 'core/types/common';
import type { TranslationKeys } from 'core/types/i18n';
import type { NotificationType } from 'features/shared/notification/notification.types';

class NotificationMetadataDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(modelKeyName)
  modelKey: ModelKeys;

  @IsNotEmpty()
  @IsMongoId()
  refId: Types.ObjectId;

  @IsOptional()
  @IsString()
  context?: string;
}

export class CreateNotificationDto<T extends TranslationKeys> {
  @IsNotEmpty()
  @IsIn(notificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsMongoId()
  receiverId: string;

  @IsNotEmpty()
  @IsMongoId()
  senderId: string;

  @IsOptional()
  @IsBoolean()
  seen: boolean;

  @IsOptional()
  @Type(() => NotificationMetadataDto)
  metadata: NotificationMetadataDto;

  @IsOptional()
  @IsString()
  messageKey: T;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  seen: boolean;
}

export class NotificationResponseDto extends BaseResponseDto {
  @Expose()
  message: string;

  @Expose()
  seen: boolean;

  @Expose()
  @Type(() => ClientPostSummaryResponseDto)
  post: ClientPostSummaryResponseDto;
}

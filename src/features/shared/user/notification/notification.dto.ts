import { ValidateIf } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { modelKeyName } from 'core/utilities/common';
import { notificationTypeOptions } from 'features/shared/user/notification/notification.constants';
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
import { ClientPostSummaryResponseDto } from 'features/client/post/core/post.client.dto';

// Types
import type { Types } from 'mongoose';
import type { ModelKeys } from 'core/types/common';
import type { TranslationKeys } from 'core/types/i18n';
import type { NotificationType } from 'features/shared/user/notification/notification.types';

class NotificationMetadataDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(modelKeyName)
  sourceType?: ModelKeys;

  @IsNotEmpty()
  @IsMongoId()
  sourceId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  @IsIn(modelKeyName)
  parentType?: ModelKeys;

  @ValidateIf(({ obj }) => Boolean(obj.parentType))
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  context?: string;
}

export class CreateNotificationDto<T extends TranslationKeys> {
  @IsNotEmpty()
  @IsIn(notificationTypeOptions)
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
  metadata?: NotificationMetadataDto;

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

import type { ModelKeys } from 'core/types/common';
import type { TranslationKeys } from 'core/types/i18n';
import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<INotificationEntity>;
export type NotificationLeanDocument = FlattenMaps<INotificationEntity>;

export type NotificationType = 'comment-reply' | 'new-post' | 'post-reply';

export interface NotificationMetadata {
  sourceType: ModelKeys;
  sourceId: Types.ObjectId;
  parentType?: ModelKeys;
  parentId?: Types.ObjectId;
  context?: string; // STORE JSON as String and Parse back
}

export interface INotificationEntity {
  _id: Types.ObjectId;
  type: NotificationType;
  receiverId: Types.ObjectId;
  senderId: Types.ObjectId;
  seen: boolean;
  message: string;
  metadata: NotificationMetadata;
  messageKey: TranslationKeys;
  messageData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

import { Model, Schema, model } from 'mongoose';

// Utilities
import { modelKeyName } from 'core/utilities/common';
import { notificationType } from 'features/shared/notification/notification.constants';

// Types
import type {
  INotificationEntity,
  NotificationMetadata,
} from 'features/shared/notification/notification.types';

const metadataSchema = new Schema<NotificationMetadata>(
  {
    sourceType: { type: String, enum: modelKeyName, required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    parentType: { type: String, enum: modelKeyName, required: false },
    parentId: { type: Schema.Types.ObjectId, required: false },
    context: { type: String, trim: true },
  },
  { _id: false }
);

const notificationSchema = new Schema<
  INotificationEntity,
  Model<INotificationEntity>
>(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    seen: {
      type: Boolean,
      index: true,
      default: false,
    },
    type: {
      type: String,
      enum: notificationType,
      index: true,
      required: true,
    },
    messageKey: { type: String, required: true },
    metadata: { type: metadataSchema, required: false },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 * 3 });

const Notification = model('Notification', notificationSchema);

export default Notification;

import { model, Schema, Model } from 'mongoose';

// Utilities
import { banType } from 'features/management/user/ban/ban.constant';

// Types
import type { IBanEntity } from 'features/management/user/ban/ban.types';

const userBanSchema = new Schema<IBanEntity, Model<IBanEntity>>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
      immutable: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: banType,
      required: true,
      index: true,
    },
    startAt: {
      type: Date,
      default: Date.now,
    },
    endAt: {
      type: Date,
      default: null,
      required: function () {
        return this.type === 'permanent';
      },
    },
  },
  { timestamps: true }
);

export const UserBan = model<IBanEntity>('UserBan', userBanSchema);

export default UserBan;

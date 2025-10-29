import { model, Schema, Model } from 'mongoose';

// Types
import type { IFollowEntity } from 'features/shared/follow/follow.types';

const followSchema = new Schema<IFollowEntity, Model<IFollowEntity>>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ user: 1, followed: 1 }, { unique: true });

export const Follow = model<IFollowEntity>('Follow', followSchema);

export default Follow;

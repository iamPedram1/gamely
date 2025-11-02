import { model, Schema, Model } from 'mongoose';

// Types
import type { IFollowEntity } from 'features/shared/user/follow/follow.types';

const followSchema = new Schema<IFollowEntity, Model<IFollowEntity>>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = model<IFollowEntity>('Follow', followSchema);

export default Follow;

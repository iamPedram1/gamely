import { model, Schema, Model } from 'mongoose';

// Types
import type { IUserFollowEntity } from 'features/shared/userFollow/userFollow.types';

const userFollowSchema = new Schema<
  IUserFollowEntity,
  Model<IUserFollowEntity>
>(
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

userFollowSchema.index({ user: 1, followed: 1 }, { unique: true });

export const UserFollow = model<IUserFollowEntity>(
  'UserFollow',
  userFollowSchema
);

export default UserFollow;

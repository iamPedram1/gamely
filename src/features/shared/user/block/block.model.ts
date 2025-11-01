import { model, Schema, Model } from 'mongoose';

// Types
import type { IBlockEntity } from 'features/shared/user/block/block.types';

const blockSchema = new Schema<IBlockEntity, Model<IBlockEntity>>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    blocked: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

blockSchema.index({ user: 1, blocked: 1 }, { unique: true });

export const UserBlock = model<IBlockEntity>('Block', blockSchema);

export default UserBlock;

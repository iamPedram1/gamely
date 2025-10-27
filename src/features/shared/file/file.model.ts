import { model, Model, Schema } from 'mongoose';

// Types
import type { IFileEntity } from 'features/shared/file/file.types';

const fileSchema = new Schema<IFileEntity, Model<IFileEntity>>(
  {
    originalname: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: String,
      enum: ['game', 'post', 'user'],
      required: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const File = model<IFileEntity>('File', fileSchema);

export default File;

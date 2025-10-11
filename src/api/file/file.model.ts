import mongoose, { FlattenMaps, HydratedDocument, Schema } from 'mongoose';

// Types
import type { IFileEntity } from 'api/file/file.type';

export type FileDocument = HydratedDocument<IFileEntity>;
export type FileLeanDocument = FlattenMaps<FileDocument>;

const fileSchema = new mongoose.Schema<
  IFileEntity,
  mongoose.Model<IFileEntity>
>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalname: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
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

export const File = mongoose.model<IFileEntity>('File', fileSchema);

export default File;

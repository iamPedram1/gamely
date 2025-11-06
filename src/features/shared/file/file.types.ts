// Types
import type { FlattenMaps, HydratedDocument, ObjectId } from 'mongoose';
import type { IUser } from 'features/shared/user/core/user.types';
import type {
  FileResponseDto,
  FileSummaryResponseDto,
} from 'features/shared/file/file.dto';

export type FileDocument = HydratedDocument<IFileEntity>;
export type FileLeanDocument = FlattenMaps<IFileEntity>;

export type FileLocationType = 'game' | 'post' | 'user';

export interface IFileEntity {
  _id: ObjectId;
  creator: IUser;
  createdAt: Date;
  updatedAt: Date;
  location: FileLocationType;
  originalname: string;
  size: number;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
}

export type IFile = InstanceType<typeof FileResponseDto>;
export type IFileSummary = InstanceType<typeof FileSummaryResponseDto>;

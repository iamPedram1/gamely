// Types
import {
  FileResponseDto,
  FileSummaryResponseDto,
} from 'features/shared/file/file.dto';
import type { IUser } from 'features/shared/user/user.types';

export type IFileLocation = 'game' | 'post' | 'user';

export interface IFileEntity extends Omit<Document, 'location'> {
  _id: string;
  creator: IUser;
  createdAt: Date;
  updatedAt: Date;
  location: IFileLocation;
  originalname: string;
  size: number;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
}

export type IFile = InstanceType<typeof FileResponseDto>;
export type IFileSummary = InstanceType<typeof FileSummaryResponseDto>;

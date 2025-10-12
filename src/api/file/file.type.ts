// Types
import { FileResponseDto, FileSummaryResponseDto } from 'api/file/file.dto';
import type { IUser } from 'api/user/user.types';

export type IFileLocation = 'game' | 'post' | 'user';

export interface IFileEntity {
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

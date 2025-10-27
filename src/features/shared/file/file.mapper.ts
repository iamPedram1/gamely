import { singleton } from 'tsyringe';

// DTO
import {
  FileResponseDto,
  FileSummaryResponseDto,
} from 'features/shared/file/file.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';

// Types
import {
  FileDocument,
  FileLeanDocument,
} from 'features/shared/file/file.types';

export type IFileMapper = InstanceType<typeof FileMapper>;

@singleton()
export class FileMapper extends BaseMapper<
  FileDocument,
  FileLeanDocument,
  FileResponseDto,
  FileSummaryResponseDto
> {
  constructor() {
    super(FileResponseDto, FileSummaryResponseDto);
  }
}

import { singleton } from 'tsyringe';

// Model
import {
  FileDocument,
  FileLeanDocument,
} from 'features/shared/file/file.model';

// DTO
import {
  FileResponseDto,
  FileSummaryResponseDto,
} from 'features/shared/file/file.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';

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

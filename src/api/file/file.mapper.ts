import { singleton } from 'tsyringe';

// Model
import { FileDocument, FileLeanDocument } from 'api/file/file.model';

// Dto
import { FileResponseDto, FileSummaryResponseDto } from 'api/file/file.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

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

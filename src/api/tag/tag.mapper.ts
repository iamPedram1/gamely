// Model
import { singleton } from 'tsyringe';
import { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

// Dto
import { TagResponseDto, TagSummaryResponseDto } from 'api/tag/tag.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export type ITagMapper = InstanceType<typeof TagMapper>;

@singleton()
export class TagMapper extends BaseMapper<
  TagDocument,
  TagLeanDocument,
  TagResponseDto,
  TagSummaryResponseDto
> {
  constructor() {
    super(TagResponseDto, TagSummaryResponseDto);
  }
}

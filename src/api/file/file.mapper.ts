// Model
import { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

// Dto
import { TagResponseDto, TagSummaryResponseDto } from 'api/tag/tag.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export interface ITagMapper {
  toDto: (tag: TagDocument | TagLeanDocument) => TagResponseDto;
  toSummaryDto: (tag: TagDocument | TagLeanDocument) => TagSummaryResponseDto;
}

export class TagMapper
  extends BaseMapper<
    TagDocument,
    TagLeanDocument,
    TagResponseDto,
    TagSummaryResponseDto
  >
  implements ITagMapper
{
  constructor() {
    super(TagResponseDto, TagSummaryResponseDto);
  }
}

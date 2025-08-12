import { plainToInstance } from 'class-transformer';

// Model
import { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

// Dto
import { TagResponseDto, TagSummaryResponseDto } from 'api/tag/tag.dto';

export interface ITagMapper {
  toTagDto: (tag: TagDocument | TagLeanDocument) => TagResponseDto;
  toTagSummaryDto: (
    tag: TagDocument | TagLeanDocument
  ) => TagSummaryResponseDto;
}

export class TagMapper implements ITagMapper {
  private toPlain(tag: TagDocument | TagLeanDocument) {
    return tag.toObject();
  }

  toTagDto(tag: TagDocument | TagLeanDocument) {
    return plainToInstance(TagResponseDto, this.toPlain(tag), {
      excludeExtraneousValues: true,
    });
  }

  toTagSummaryDto(tag: TagDocument | TagLeanDocument) {
    return plainToInstance(TagSummaryResponseDto, this.toPlain(tag), {
      excludeExtraneousValues: true,
    });
  }
}

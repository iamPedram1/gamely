// Model
import { singleton } from 'tsyringe';
import { TagDocument, TagLeanDocument } from 'features/shared/tag/tag.model';

// DTO

// Mapper
import { BaseMapper } from 'core/mappers/base';
import { ITagEntity } from 'features/shared/tag/tag.type';
import { TagClientResponseDto } from 'features/client/tag/tag.dto';
import {
  TagManagementResponseDto,
  TagManagementSummaryResponseDto,
} from 'features/management/tag/tag.dto';
import { TagClientSummaryResponseDto } from 'features/shared/tag/tag.dto';

export type ITagMapper = InstanceType<typeof TagMapper>;

@singleton()
export class TagMapper extends BaseMapper<
  ITagEntity | TagDocument,
  TagLeanDocument,
  TagClientResponseDto,
  TagManagementResponseDto,
  TagClientSummaryResponseDto,
  TagManagementSummaryResponseDto
> {
  constructor() {
    super(
      TagClientResponseDto,
      TagManagementResponseDto,
      TagClientSummaryResponseDto,
      TagManagementSummaryResponseDto
    );
  }
}

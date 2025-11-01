// Model
import { singleton } from 'tsyringe';

// DTO
import {
  TagClientResponseDto,
  TagClientSummaryResponseDto,
} from 'features/client/tag/tag.client.dto';
import {
  TagManagementResponseDto,
  TagManagementSummaryResponseDto,
} from 'features/management/tag/tag.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Type
import { ITagEntity } from 'features/shared/tag/tag.types';

export type ITagMapper = InstanceType<typeof TagMapper>;

@singleton()
export class TagMapper extends BaseMapper<
  ITagEntity,
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

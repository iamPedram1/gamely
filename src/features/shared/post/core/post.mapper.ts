import { singleton } from 'tsyringe';

// DTO
import {
  ClientPostResponseDto,
  ClientPostSummaryResponseDto,
} from 'features/client/post/core/post.client.dto';
import {
  PostManagementResponseDto,
  PostManagementSummaryResponseDto,
} from 'features/management/post/core/post.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import type { IPostEntity } from 'features/shared/post/core/post.types';

export type IPostMapper = InstanceType<typeof PostMapper>;

@singleton()
export class PostMapper extends BaseMapper<
  IPostEntity,
  ClientPostResponseDto,
  PostManagementResponseDto,
  ClientPostSummaryResponseDto,
  PostManagementSummaryResponseDto
> {
  constructor() {
    super(
      ClientPostResponseDto,
      PostManagementResponseDto,
      ClientPostSummaryResponseDto,
      PostManagementSummaryResponseDto
    );
  }
}

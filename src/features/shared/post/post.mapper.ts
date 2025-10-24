import { singleton } from 'tsyringe';

// DTO
import {
  ClientPostResponseDto,
  ClientPostSummaryResponseDto,
} from 'features/client/post/post.client.dto';
import {
  PostManagementResponseDto,
  PostManagementSummaryResponseDto,
} from 'features/management/post/post.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import {
  PostDocument,
  PostLeanDocument,
} from 'features/shared/post/post.model';

export type IPostMapper = InstanceType<typeof PostMapper>;

@singleton()
export class PostMapper extends BaseMapper<
  PostDocument,
  PostLeanDocument,
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

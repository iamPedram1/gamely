import { singleton } from 'tsyringe';

// Dto
import {
  UserPostResponseDto,
  UserPostSummaryResponseDto,
} from 'features/public/post/post.public.dto';
import {
  AdminPostResponseDto,
  AdminPostSummaryResponseDto,
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
  UserPostResponseDto,
  AdminPostResponseDto,
  UserPostSummaryResponseDto,
  AdminPostSummaryResponseDto
> {
  constructor() {
    super(
      UserPostResponseDto,
      AdminPostResponseDto,
      UserPostSummaryResponseDto,
      AdminPostSummaryResponseDto
    );
  }
}

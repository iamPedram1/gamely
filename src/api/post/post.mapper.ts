import { singleton } from 'tsyringe';

// Dto
import { PostResponseDto, PostSummaryResponseDto } from 'api/post/post.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

// Types
import { PostDocument, PostLeanDocument } from 'api/post/post.model';

export type IPostMapper = InstanceType<typeof PostMapper>;

@singleton()
export class PostMapper extends BaseMapper<
  PostDocument,
  PostLeanDocument,
  PostResponseDto,
  PostSummaryResponseDto
> {
  constructor() {
    super(PostResponseDto, PostSummaryResponseDto);
  }
}

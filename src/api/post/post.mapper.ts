// Model
import { PostDocument, PostLeanDocument } from 'api/post/post.model';

// Dto
import { PostResponseDto, PostSummaryResponseDto } from 'api/post/post.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export interface IPostMapper {
  toDto: (post: PostDocument | PostLeanDocument) => PostResponseDto;
  toSummaryDto: (
    post: PostDocument | PostLeanDocument
  ) => PostSummaryResponseDto;
}

export class PostMapper
  extends BaseMapper<
    PostDocument,
    PostLeanDocument,
    PostResponseDto,
    PostSummaryResponseDto
  >
  implements IPostMapper
{
  constructor() {
    super(PostResponseDto, PostSummaryResponseDto);
  }
}

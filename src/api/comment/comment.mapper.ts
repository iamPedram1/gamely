import { singleton } from 'tsyringe';

// DTO
import {
  CommentResponseDto,
  CommentSummaryResponseDto,
} from 'api/comment/comment.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';

// Types
import type {
  CommentDocument,
  CommentLeanDocument,
} from 'api/comment/comment.model';

export type ICommentMapper = InstanceType<typeof CommentMapper>;

@singleton()
export class CommentMapper extends BaseMapper<
  CommentDocument,
  CommentLeanDocument,
  CommentResponseDto,
  CommentSummaryResponseDto
> {
  constructor() {
    super(CommentResponseDto, CommentSummaryResponseDto);
  }
}

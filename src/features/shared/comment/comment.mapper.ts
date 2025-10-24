import { singleton } from 'tsyringe';

// DTO
import {
  CommentClientResponseDto,
  CommentClientSummaryResponseDto,
} from 'features/client/comment/comment.client.dto';
import {
  CommentManagementResponseDto,
  CommentManagementSummaryResponseDto,
} from 'features/management/comment/comment.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import type {
  CommentDocument,
  CommentLeanDocument,
} from 'features/shared/comment/comment.model';

export type ICommentMapper = InstanceType<typeof CommentMapper>;

@singleton()
export class CommentMapper extends BaseMapper<
  CommentDocument,
  CommentLeanDocument,
  CommentClientResponseDto,
  CommentManagementResponseDto,
  CommentClientSummaryResponseDto,
  CommentManagementSummaryResponseDto
> {
  constructor() {
    super(
      CommentClientResponseDto,
      CommentManagementResponseDto,
      CommentClientSummaryResponseDto,
      CommentManagementSummaryResponseDto
    );
  }
}

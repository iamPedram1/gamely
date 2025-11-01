import { singleton } from 'tsyringe';

// DTO
import {
  CommentClientResponseDto,
  CommentClientSummaryResponseDto,
} from 'features/client/post/comment/comment.client.dto';
import {
  CommentManagementResponseDto,
  CommentManagementSummaryResponseDto,
} from 'features/management/post/comment/comment.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';
import { ICommentEntity } from 'features/shared/post/comment/comment.types';

// Types
export type ICommentMapper = InstanceType<typeof CommentMapper>;

@singleton()
export class CommentMapper extends BaseMapper<
  ICommentEntity,
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

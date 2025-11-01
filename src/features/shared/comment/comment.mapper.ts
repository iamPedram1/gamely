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
import { ICommentEntity } from 'features/shared/comment/comment.types';

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

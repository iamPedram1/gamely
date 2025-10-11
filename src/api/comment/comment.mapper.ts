// Model
import {
  CommentDocument,
  CommentLeanDocument,
} from 'api/comment/comment.model';

// Dto
import {
  CommentResponseDto,
  CommentSummaryResponseDto,
} from 'api/comment/comment.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export interface ICommentMapper {
  toDto: (tag: CommentDocument | CommentLeanDocument) => CommentResponseDto;
  toSummaryDto: (
    tag: CommentDocument | CommentLeanDocument
  ) => CommentSummaryResponseDto;
}

export class CommentMapper
  extends BaseMapper<
    CommentDocument,
    CommentLeanDocument,
    CommentResponseDto,
    CommentSummaryResponseDto
  >
  implements ICommentMapper
{
  constructor() {
    super(CommentResponseDto, CommentSummaryResponseDto);
  }
}

import type { Document, Types } from 'mongoose';

// Models
import Comment from 'api/comment/comment.model';

// DTO
import { CreateCommentDto, UpdateCommentDto } from 'api/comment/comment.dto';

// Services
import BaseService from 'services/base.service.module';

// Utils
import { NotFoundError } from 'utilites/errors';

// Types
import type { IRequestQueryBase } from 'types/query';
import type {
  BaseMutateOptions,
  IBaseService,
} from 'services/base.service.type';
import type { WithPagination } from 'types/paginate';
import type { CommentType, ICommentEntity } from 'api/comment/comment.type';
import type {
  CommentDocument,
  CommentLeanDocument,
} from 'api/comment/comment.model';
import { singleton } from 'tsyringe';

type CreateCommentInput = CreateCommentDto & {
  postId: string;
  type: CommentType;
  threadId?: Types.ObjectId | null;
};

export interface ICommentService
  extends IBaseService<ICommentEntity, CreateCommentInput, UpdateCommentDto> {
  getPostComments: (
    postId: string,
    reqQuery?: IRequestQueryBase
  ) => Promise<WithPagination<CommentLeanDocument>>;
}

type ParentMap = Record<string, number[]>;
type CommentWithReplies = CommentLeanDocument & {
  replies: CommentWithReplies[];
};

@singleton()
class CommentService extends BaseService<
  ICommentEntity,
  CreateCommentInput,
  UpdateCommentDto
> {
  constructor() {
    super(Comment);
  }

  async getPostComments(
    postId: string,
    reqQuery?: IRequestQueryBase
  ): Promise<WithPagination<CommentLeanDocument>> {
    const firstLevel = await super.find({
      reqQuery,
      filter: { postId, type: 'main' },
      populate: 'creator',
      lean: true,
    });

    const ids = firstLevel.docs.map((doc) => String(doc._id));
    const replies = await super.find({
      filter: { postId, type: 'reply', threadId: { $in: ids } },
      lean: true,
      paginate: false,
      populate: 'creator',
    });

    const allComments = [
      ...firstLevel.docs,
      ...replies,
    ] as CommentWithReplies[];

    return {
      docs: this.attachReplies(allComments),
      pagination: firstLevel.pagination,
    };
  }

  async create(
    data: Partial<CreateCommentInput>,
    userId?: string,
    options?: BaseMutateOptions
  ): Promise<
    Document<unknown, {}, ICommentEntity, {}, {}> &
      ICommentEntity &
      Required<{ _id: Types.ObjectId }> & { __v: number }
  > {
    if (data.replyToCommentId) {
      const comment = await this.getOneById(data.replyToCommentId, {
        lean: true,
      });
      if (!comment)
        throw new NotFoundError('Comment with the given id does not exist');
      data.type = 'reply';
      data.threadId = comment.threadId || comment._id;
    } else data.type = 'main';

    return super.create(data, userId, options);
  }

  private getReplies(
    comment: CommentWithReplies,
    comments: CommentWithReplies[],
    parentMap: ParentMap
  ) {
    const id = comment?._id ? String(comment._id) : '';
    return (id ? parentMap?.[id] || [] : []).map((index) => {
      const category = comments[index];
      const isReply = category.replyToCommentId
        ? String(category.replyToCommentId)
        : null;
      if (isReply)
        category.replies = this.getReplies(category, comments, parentMap);
      return category;
    });
  }

  private attachReplies(comments: CommentWithReplies[]) {
    const parentMap: Record<string, CommentWithReplies[]> = {};

    // Build Parent Map
    comments.forEach((comment) => {
      const parentId = comment.replyToCommentId
        ? String(comment.replyToCommentId)
        : null;
      if (!parentId) return;

      if (!parentMap[parentId]) parentMap[parentId] = [];
      parentMap[parentId].push(comment);
    });

    // Attach replies recursively
    const attach = (comment: CommentWithReplies) => {
      comment.replies = parentMap[String(comment._id)] || [];
      comment.replies.forEach(attach); // recursive
    };

    // Only attach to first-level comments
    const mainComments = comments.filter((c) => c.type === 'main');
    mainComments.forEach(attach);

    return mainComments;
  }
}

export default CommentService;

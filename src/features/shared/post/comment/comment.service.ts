import { delay, inject, singleton } from 'tsyringe';

// Models
import Comment from 'features/shared/post/comment/comment.model';

// DTO
import { CreateCommentDto } from 'features/client/post/comment/comment.client.dto';
import { UpdateCommentDto } from 'features/management/post/comment/comment.management.dto';

// Services
import BaseService from 'core/services/base/base.service';
import PostService from 'features/shared/post/core/post.service';
import BlockService from 'features/shared/user/block/block.service';
import NotificationService from 'features/shared/user/notification/notification.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { IPostEntity } from 'features/shared/post/core/post.types';
import type { Types } from 'mongoose';
import type { WithPagination } from 'core/types/paginate';
import type { IRequestQueryBase } from 'core/types/query';
import type {
  CommentType,
  ICommentEntity,
} from 'features/shared/post/comment/comment.types';
import type {
  BaseMutateOptions,
  IBaseService,
} from 'core/types/base.service.type';
import type {
  CommentDocument,
  CommentLeanDocument,
} from 'features/shared/post/comment/comment.types';

type CreateCommentInput = CreateCommentDto & {
  post: string;
  parentIds: Types.ObjectId[];
  type?: CommentType;
  thread?: Types.ObjectId | null;
};

export interface ICommentService extends IBaseService<ICommentEntity> {
  getPostComments: (
    postId: string,
    query?: IRequestQueryBase
  ) => Promise<WithPagination<CommentLeanDocument>>;
}

type ParentMap = Record<string, number[]>;
type CommentWithReplies = CommentLeanDocument & {
  replies: CommentWithReplies[];
};

@singleton()
class CommentService extends BaseService<ICommentEntity, CommentDocument> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService,
    @inject(delay(() => BlockService)) private blockService: BlockService,
    @inject(delay(() => NotificationService))
    private notificationService: NotificationService
  ) {
    super(Comment);
  }

  async deleteOneById<TThrowError extends boolean = true>(
    id: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    await this.withTransaction(async (session) => {
      if (this.currentUser.is('author')) {
        const post = await this.getCommentPost(id);
        await this.postService.assertOwnership(post);
      }

      await Promise.all([
        this.notificationService.deleteManyWithConditions(
          { 'metadata.refId': id, 'metadata.modelKey': 'Comment' },
          { ...options, session }
        ),
        this.deleteManyWithConditions(
          { $or: [{ _id: id }, { parentIds: { $in: id } }] },
          { ...options, session }
        ),
      ]);
    }, options?.session);

    return true;
  }

  async getPostComments(
    postId: string,
    query?: IRequestQueryBase
  ): Promise<WithPagination<CommentLeanDocument>> {
    const firstLevel = await super.find({
      query,
      lean: true,
      filter: { post: postId, type: 'main' },
      populate: [{ path: 'creator', populate: 'avatar' }],
    });

    const ids = firstLevel.docs.map((doc) => String(doc._id));
    const replies = await super.find({
      filter: { post: postId, type: 'reply', thread: { $in: ids } },
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
    data: CreateCommentInput,
    options?: BaseMutateOptions
  ): Promise<CommentDocument> {
    const isReply = Boolean(data.replyToComment);

    // --- Fetch target post + optional parent comment ---
    const [post, parentComment] = await Promise.all([
      this.postService.getOneById(data.post, { lean: true, select: 'creator' }),
      ...(isReply
        ? [this.getOneById(data.replyToComment!, { lean: true })]
        : []),
    ]);

    // --- Validate block relations ---
    const [isBlockedByAuthor, isBlockedByUser = false] = await Promise.all([
      this.blockService.checkIsBlock(post.creator._id, this.currentUser.id),
      ...(parentComment
        ? [
            this.blockService.checkIsBlock(
              parentComment.creator._id,
              this.currentUser.id
            ),
          ]
        : []),
    ]);

    if (isBlockedByAuthor) {
      throw new ValidationError(
        this.t('error.block.have_been_blocked_by_author')
      );
    }

    if (isReply && isBlockedByUser) {
      throw new ValidationError(
        this.t('error.block.have_been_blocked_by_user')
      );
    }

    // --- Prepare comment data ---
    if (isReply && parentComment) {
      data.type = 'reply';
      data.thread = parentComment.thread || parentComment._id;
      data.parentIds = [...(parentComment.parentIds ?? []), parentComment._id];
    } else {
      data.type = 'main';
    }

    // --- Create comment in a transaction ---
    return await this.withTransaction(async (session) => {
      const newComment = await (
        await super.create(data, { ...options, session })
      ).populate('replyToComment');

      if (isReply) {
        await this.notificationService.sendCommentReplyNotify(
          newComment as any,
          { session }
        );
      }

      return newComment;
    }, options?.session);
  }
  async updateOneById(
    commentId: string,
    payload: UpdateCommentDto,
    options?: BaseMutateOptions
  ) {
    return await this.withTransaction(async (session) => {
      const comment = await this.getOneById(commentId, {
        populate: 'replyToComment post',
      });
      const post = comment.post as unknown as IPostEntity;

      // Ownership check for authors
      if (this.currentUser.is('author')) {
        await this.postService.assertOwnership(post);
      }

      this.setIfDefined(comment, 'message', payload.message);

      return await comment.save({ session, ...options });
    }, options?.session);
  }

  private async getCommentPost(commentId: string) {
    const cm = await this.getOneById(commentId, { lean: true });
    return await this.postService.getOneById(cm.post.toHexString());
  }

  private getReplies(
    comment: CommentWithReplies,
    comments: CommentWithReplies[],
    parentMap: ParentMap
  ) {
    const id = comment?._id ? String(comment._id) : '';
    return (id ? parentMap?.[id] || [] : []).map((index) => {
      const category = comments[index];
      const isReply = category.replyToComment
        ? String(category.replyToComment)
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
      const parentId = comment.replyToComment
        ? String(comment.replyToComment)
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

import { delay, inject, singleton } from 'tsyringe';

// Models
import Comment from 'features/shared/comment/comment.model';

// DTO
import { CreateCommentDto } from 'features/client/comment/comment.client.dto';
import { UpdateCommentDto } from 'features/management/comment/comment.management.dto';

// Services
import BaseService from 'core/services/base/base.service';
import PostService from 'features/shared/post/post.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { IPostEntity } from 'features/shared/post/post.types';
import type { Types } from 'mongoose';
import type { WithPagination } from 'core/types/paginate';
import type { IRequestQueryBase } from 'core/types/query';
import type {
  CommentType,
  ICommentEntity,
  ICommentPopulated,
} from 'features/shared/comment/comment.types';
import type {
  BaseMutateOptions,
  IBaseService,
} from 'core/types/base.service.type';
import type {
  CommentDocument,
  CommentLeanDocument,
} from 'features/shared/comment/comment.types';
import NotificationService from 'features/shared/notification/notification.service';

type CreateCommentInput = CreateCommentDto & {
  postId: string;
  parentIds: Types.ObjectId[];
  type?: CommentType;
  threadId?: Types.ObjectId | null;
};

export interface ICommentService
  extends IBaseService<ICommentEntity, CreateCommentInput, UpdateCommentDto> {
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
class CommentService extends BaseService<
  ICommentEntity,
  CreateCommentInput,
  UpdateCommentDto,
  CommentDocument
> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService,
    @inject(delay(() => NotificationService))
    private notificationService: NotificationService
  ) {
    super(Comment);
  }

  async deleteOneById<TThrowError extends boolean = true>(
    id: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    this.withTransaction(async (session) => {
      if (this.currentUser.is('author')) {
        const post = await this.getCommentPost(id);
        await this.postService.assertOwnership(post);
      }

      await this.notificationService.deleteManyWithConditions(
        { 'metadata.refId': id, 'metadata.modelKey': 'Comment' },
        { ...options, session }
      );

      await this.deleteManyWithConditions(
        { $or: [{ _id: id }, { parentIds: { $in: id } }] },
        { ...options, session }
      );
    });

    return true;
  }

  async getPostComments(
    postId: string,
    query?: IRequestQueryBase
  ): Promise<WithPagination<CommentLeanDocument>> {
    const firstLevel = await super.find({
      query,
      lean: true,
      filter: { postId, type: 'main' },
      populate: [{ path: 'creator', populate: 'avatar' }],
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

  async getPostApprovedComments(postId: string, query: any) {
    const firstLevel = await super.find({
      query,
      lean: true,
      filter: { postId, status: 'approved', type: 'main' },
      populate: [{ path: 'creator', populate: 'avatar' }],
    });

    const ids = firstLevel.docs.map((doc) => String(doc._id));
    const replies = await super.find({
      filter: {
        postId,
        type: 'reply',
        status: 'approved',
        threadId: { $in: ids },
      },
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
    if (data.replyToCommentId) {
      const cm = await this.getOneById(data.replyToCommentId, { lean: true });
      data.type = 'reply';
      data.threadId = cm.threadId || cm._id;
      data.parentIds = [...(cm?.parentIds || []), cm._id];
    } else data.type = 'main';

    return super.create(data, options);
  }

  async updateOneById(commentId: string, payload: UpdateCommentDto) {
    return this.withTransaction(async (session) => {
      const comment = await this.getOneById(commentId, {
        populate: 'replyToCommentId postId',
      });
      const post = comment.postId as unknown as IPostEntity;
      const isCommentApproved = comment.status === 'approved';

      // Ownership check for authors
      if (this.currentUser.is('author')) {
        await this.postService.assertOwnership(post);
      }

      this.setIfDefined(comment, 'status', payload.status);
      this.setIfDefined(comment, 'message', payload.message);

      // Check if is trying to update approved comment status
      if (isCommentApproved && comment.isModified('status')) {
        throw new ValidationError(
          this.t('error.comment.approved_cannot_change')
        );
      }

      // Send notification if its replying
      if (
        comment.isModified('status') &&
        comment.status === 'approved' &&
        comment.replyToCommentId
      ) {
        await this.notificationService.createCommentReplyNotification(
          comment as unknown as ICommentPopulated,
          { session }
        );
      }

      return await comment.save({ session });
    });
  }

  private async getCommentPost(commentId: string) {
    const cm = await this.getOneById(commentId, { lean: true });
    return await this.postService.getOneById(cm.postId.toHexString());
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

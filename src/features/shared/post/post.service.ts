import { delay, inject, injectable } from 'tsyringe';

// Models
import Post from 'features/shared/post/post.model';

// DTO
import {
  CreatePostDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

// Services
import UserService from 'features/shared/user/user.service';
import BaseService from 'core/services/base/base.service';
import FileService from 'features/shared/file/file.service';
import CommentService from 'features/shared/comment/comment.service';
import NotificationService from 'features/shared/notification/notification.service';

// Utilities
import logger from 'core/utilities/logger';

// Types
import type { DocumentId } from 'core/types/common';
import type { IPostEntity } from 'features/shared/post/post.types';
import type { PostDocument } from 'features/shared/post/post.types';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { IApiBatchResponse } from 'core/utilities/response';

export type IPostService = InstanceType<typeof PostService>;
@injectable()
class PostService extends BaseService<IPostEntity> {
  constructor(
    @inject(delay(() => FileService)) private fileService: FileService,
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => CommentService)) private commentService: CommentService,
    @inject(delay(() => NotificationService))
    private notificationService: NotificationService
  ) {
    super(Post);
  }

  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<IApiBatchResponse> {
    return this.withTransaction(async (session) => {
      const posts = await this.find({
        filter: { _id: { $in: ids } },
        lean: true,
        paginate: false,
      });

      if (posts.length > 0) {
        let userCountMap = new Map<string, number>();

        for (let post of posts) {
          const userId = String(post.creator._id);
          const count = userCountMap.get(userId) || 0;
          userCountMap.set(userId, count + 1);
        }

        if (userCountMap.size > 0) {
          await Promise.all(
            Array.from(userCountMap).map(([userId, decrementCount]) =>
              this.userService.adjustPostCount(userId, decrementCount, {
                session,
              })
            )
          );
        }
      }

      return await super.batchDelete(ids, {
        ...(this.currentUser.isNot(['admin', 'superAdmin']) && {
          additionalFilter: { creator: this.currentUser.id },
        }),
        session,
      });
    }, options?.session);
  }

  async create<TThrowError extends boolean = true>(
    data: CreatePostDto,
    options?:
      | (BaseMutateOptions<boolean> & { throwError?: TThrowError | undefined })
      | undefined
  ): Promise<TThrowError extends true ? PostDocument : PostDocument | null> {
    return this.withTransaction(async (session) => {
      const post = await super.create(data, {
        ...options,
        session,
        throwError: true,
      });

      await Promise.all([
        this.userService.adjustPostCount(this.currentUser.id, 1, { session }),
        this.notificationService.sendPostNotifyToFollowers(
          post._id,
          this.currentUser.id,
          { session }
        ),
      ]);

      return post;
    }, options?.session);
  }

  async updateOneById<TThrowError extends boolean = true>(
    id: string,
    payload: Partial<UpdatePostDto>,
    options?:
      | (BaseMutateOptions<boolean> & { throwError?: TThrowError | undefined })
      | undefined
  ): Promise<TThrowError extends true ? PostDocument : PostDocument | null> {
    if (this.currentUser.is('author')) await this.assertOwnership(id);

    return await super.updateOneById(id, payload, options);
  }

  async deleteOneById(
    id: DocumentId,
    options?: BaseMutateOptions
  ): Promise<true> {
    return this.withTransaction(async (session) => {
      const post = await super.getOneById(id, { lean: true });
      const creatorId = String(post.creator._id);

      await this.assertOwnership(post);

      // Delete the post itself first
      const result = await super.deleteOneById(id, { session, ...options });

      // Prepare cleanup operations
      const cleanupTasks: Promise<any>[] = [
        this.commentService.deleteManyByKey('postId', id, { session }),
        this.notificationService.deletePostAllNotification(id, { session }),
        this.userService.adjustPostCount(creatorId, -1, { session }),
      ];

      if (post.coverImage) {
        cleanupTasks.push(
          this.fileService.deleteOneById(post.coverImage._id, { session })
        );
      }

      // Run all cleanup operations in parallel
      const results = await Promise.allSettled(cleanupTasks);
      for (const r of results)
        if (r.status === 'rejected') logger.error('Cleanup failed:', r.reason);

      return result;
    }, options?.session);
  }
}

export default PostService;

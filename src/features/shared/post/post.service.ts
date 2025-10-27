import { delay, inject, injectable } from 'tsyringe';

// Models
import Post from 'features/shared/post/post.model';

// DTO
import {
  CreatePostDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

// Services
import BaseService from 'core/services/base/base.service';
import FileService from 'features/shared/file/file.service';
import CommentService from 'features/shared/comment/comment.service';

// Validations
import { PostValidation } from 'features/shared/post/post.validation';

// Utilities
import logger from 'core/utilities/logger';

// Types
import type { IPostEntity } from 'features/shared/post/post.type';
import type { PostDocument } from 'features/shared/post/post.model';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { IApiBatchResponse } from 'core/utilities/response';

export type IPostService = InstanceType<typeof PostService>;
@injectable()
class PostService extends BaseService<
  IPostEntity,
  CreatePostDto,
  UpdatePostDto,
  PostDocument
> {
  constructor(
    @inject(delay(() => FileService)) private fileService: FileService,
    @inject(delay(() => CommentService)) private commentService: CommentService,
    @inject(delay(() => PostValidation)) private postValidation: PostValidation
  ) {
    super(Post);
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    return await super.batchDelete(ids, {
      ...(this.currentUser.isNot('admin') && {
        additionalFilter: { creator: this.currentUser.id },
      }),
    });
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

  async deleteOneById(id: string): Promise<true> {
    return this.withTransaction(async (session) => {
      const post = await super.getOneById(id, { lean: true });
      await this.assertOwnership(post);

      // Delete the post itself first
      const result = await super.deleteOneById(id, { session });

      // Prepare cleanup operations
      const cleanupTasks: Promise<any>[] = [
        this.commentService.deleteManyByKey('postId', id, { session }),
      ];

      if (post.coverImage) {
        cleanupTasks.push(
          this.fileService.deleteOneById(post.coverImage.toHexString(), {
            session,
          })
        );
      }

      // Run all cleanup operations in parallel
      const results = await Promise.allSettled(cleanupTasks);
      for (const r of results)
        if (r.status === 'rejected') logger.error('Cleanup failed:', r.reason);

      return result;
    });
  }
}

export default PostService;

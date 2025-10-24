import { delay, inject, injectable } from 'tsyringe';

// Models
import Post from 'features/shared/post/post.model';

// DTO
import {
  CreatePostDto,
  UpdatePostDto,
} from 'features/management/post/post.management.dto';

// Services
import FileService from 'api/file/file.service';
import BaseService from 'core/services/base/base.service';
import CommentService from 'api/comment/comment.service';

// Validations
import { PostValidation } from 'features/shared/post/post.validation';

// Utilities
import logger from 'core/utilites/logger';

// Types
import type { IPostEntity } from 'features/shared/post/post.type';
import type { PostDocument } from 'features/shared/post/post.model';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { IApiBatchResponse } from 'core/utilites/response';

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

  async getPostsBy(
    keyName: keyof IPostEntity,
    value: IPostEntity[typeof keyName]
  ): Promise<PostDocument[]> {
    return await super.find({
      filter: { [keyName]: value },
      lean: true,
      paginate: false,
    });
  }

  async create(
    data: CreatePostDto,
    userId?: string,
    options?: BaseMutateOptions
  ): Promise<PostDocument> {
    await Promise.all([
      this.postValidation.validateGame(data.game),
      this.postValidation.validateTags(data.tags),
      this.postValidation.validateCategory(data.category),
    ]);

    return await super.create(data, userId, options);
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
    const validations = [
      this.currentUser.is('author') && (await this.assertOwnership(id)),
      payload.game && this.postValidation.validateGame(payload.game),
      payload.tags && this.postValidation.validateTags(payload.tags),
      payload.category &&
        this.postValidation.validateCategory(payload.category),
    ].filter(Boolean) as Promise<void>[];

    await Promise.all(validations);

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

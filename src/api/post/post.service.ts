import { delay, inject, injectable } from 'tsyringe';

// Models
import Post from 'api/post/post.model';

// Dto
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

// Services
import FileService from 'api/file/file.service';
import BaseService from 'services/base.service.module';
import CommentService from 'api/comment/comment.service';

// Validations
import { PostValidation } from 'api/post/post.validation';

// Utilities
import logger from 'utilites/logger';
import { NotFoundError } from 'utilites/errors';

// Types
import type { DeleteResult } from 'mongoose';
import type { IPostEntity } from 'api/post/post.type';
import type { PostDocument } from 'api/post/post.model';

export type IPostService = InstanceType<typeof PostService>;
@injectable()
class PostService extends BaseService<
  IPostEntity,
  CreatePostDto,
  UpdatePostDto
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

  async create(data: CreatePostDto, userId?: string): Promise<PostDocument> {
    await Promise.all([
      this.postValidation.validateGame(data.game),
      this.postValidation.validateTags(data.tags),
      this.postValidation.validateCategory(data.category),
    ]);

    return await super.create(data, userId);
  }

  async updateOneById(id: string, payload: UpdatePostDto) {
    await Promise.all([
      ...(payload.game ? [this.postValidation.validateGame(payload.game)] : []),
      ...(payload.tags ? [this.postValidation.validateTags(payload.tags)] : []),
      ...(payload.category
        ? [this.postValidation.validateCategory(payload.category)]
        : []),
    ]);

    return await super.updateOneById(id, payload);
  }

  async deleteOneById(id: string): Promise<DeleteResult> {
    return this.withTransaction(async (session) => {
      const post = await super.getOneById(id, { lean: true });
      if (!post)
        throw new NotFoundError('Post with the given id was not found.');

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

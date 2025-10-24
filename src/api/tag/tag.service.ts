import { delay, inject, injectable } from 'tsyringe';

// Models
import Tag, { TagDocument } from 'api/tag/tag.model';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Services
import PostService from 'features/shared/post/post.service';
import BaseService from 'core/services/base/base.service';

// Custom Utilties
import { AnonymousError } from 'core/utilites/errors';

// Types
import type { ITagEntity } from 'api/tag/tag.type';
import type { IApiBatchResponse } from 'core/utilites/response';
import type { BaseMutateOptions } from 'core/types/base.service.type';

export type ITagService = InstanceType<typeof TagService>;

@injectable()
class TagService extends BaseService<
  ITagEntity,
  CreateTagDto,
  UpdateTagDto,
  TagDocument
> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService
  ) {
    super(Tag);
  }

  async getWithPostsCount(): Promise<ITagEntity[]> {
    return await super.aggregate(
      [
        {
          $lookup: {
            from: 'posts',
            let: { tagId: '$_id' },
            pipeline: [
              { $match: { $expr: { $in: ['$$tagId', '$tags'] } } },
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
            as: 'postCountArr',
          },
        },
        {
          $addFields: {
            postsCount: {
              $ifNull: [{ $arrayElemAt: ['$postCountArr.count', 0] }, 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            postsCount: 1,
          },
        },
      ],
      { paginate: false }
    );
  }

  async deleteOneById(tagId: string): Promise<true> {
    return this.withTransaction(async (session) => {
      await this.assertOwnership(tagId);

      const result = await super.deleteOneById(tagId, { session });
      await this.postService.removeIdFromArrayField('tags', tagId, { session });
      return result;
    });
  }

  async updateOneById<TThrowError extends boolean = true>(
    id: string,
    payload: Partial<UpdateTagDto>,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? TagDocument : TagDocument | null> {
    await this.assertOwnership(id);

    return super.updateOneById(id, payload, options);
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    return this.withTransaction(async (session) => {
      if (!this.currentUser)
        throw new AnonymousError('Something wrong with user context');

      await this.postService.removeIdsFromArrayField('tags', ids, { session });
      return await super.batchDelete(ids, {
        session,
        ...(this.currentUser.isNot('admin') && {
          additionalFilter: { creator: this.currentUser.id },
        }),
      });
    });
  }
}

export default TagService;

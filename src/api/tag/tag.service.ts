import { delay, inject, injectable } from 'tsyringe';

// Models
import Tag, { TagDocument } from 'api/tag/tag.model';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Services
import PostService from 'api/post/post.service';
import BaseService from 'services/base.service.module';

// Types
import type { ITagEntity } from 'api/tag/tag.type';
import type { IApiBatchResponse } from 'utilites/response';
import { PipelineStage } from 'mongoose';
import { BaseQueryOptions, AggregateReturn } from 'services/base.service.type';

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

  async deleteOneById(id: string): Promise<true> {
    return this.withTransaction(async (session) => {
      const result = await super.deleteOneById(id, { session });
      await this.postService.removeIdFromArrayField('tags', id, { session });
      return result;
    });
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    return this.withTransaction(async (session) => {
      await this.postService.removeIdsFromArrayField('tags', ids, { session });
      return await super.batchDelete(ids, { session });
    });
  }
}

export default TagService;

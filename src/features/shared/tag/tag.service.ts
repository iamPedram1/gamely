import { delay, inject, injectable } from 'tsyringe';

// Models
import Tag from 'features/shared/tag/tag.model';

// DTO
import {
  CreateTagDto,
  UpdateTagDto,
} from 'features/management/tag/tag.management.dto';

// Services
import PostService from 'features/shared/post/post.service';
import BaseService from 'core/services/base/base.service';

// Types
import type { ITagEntity } from 'features/shared/tag/tag.type';
import type { IApiBatchResponse } from 'core/utilities/response';
import type { TagDocument } from 'features/shared/tag/tag.model';
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

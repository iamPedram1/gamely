import { delay, inject, injectable } from 'tsyringe';
import type { DeleteResult } from 'mongoose';

// Models
import Tag from 'api/tag/tag.model';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Services
import PostService from 'api/post/post.service';
import BaseService from 'services/base.service.module';

// Types
import type { ITagEntity } from 'api/tag/tag.type';
import type { IApiBatchResponse } from 'utilites/response';

export type ITagService = InstanceType<typeof TagService>;

@injectable()
class TagService extends BaseService<ITagEntity, CreateTagDto, UpdateTagDto> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService
  ) {
    super(Tag);
  }

  async deleteOneById(id: string): Promise<DeleteResult> {
    return this.withTransaction(async (session) => {
      await this.postService.removeIdFromArrayField('tags', id, { session });
      return await super.deleteOneById(id, { session });
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

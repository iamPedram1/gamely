import type { DeleteResult } from 'mongoose';

// Models
import Tag from 'api/tag/tag.model';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Services
import BaseService from 'services/base.service.module';

// Types
import type { ITagEntity } from 'api/tag/tag.type';
import type { IPostService } from 'api/post/post.service';
import type { IApiBatchResponse } from 'utilites/response';

export type ITagService = InstanceType<typeof TagService>;
interface Dependencies {
  postService: IPostService;
}

class TagService
  extends BaseService<ITagEntity, CreateTagDto, UpdateTagDto>
  implements ITagService
{
  private postService: IPostService;

  constructor() {
    super(Tag);
  }

  setDependencies({ postService }: Dependencies) {
    this.postService = postService;
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

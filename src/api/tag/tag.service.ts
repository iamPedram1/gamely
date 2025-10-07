import type { DeleteResult } from 'mongoose';

// Models
import Tag from 'api/tag/tag.model';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Services
import BaseService from 'services/base';

// Types
import type IRequestQueryBase from 'types/query';
import type { ITagEntity } from 'api/tag/tag.type';
import type { IBaseService } from 'services/base';
import type { WithPagination } from 'types/paginate';
import type { IPostService } from 'api/post/post.service';
import type { TagLeanDocument } from 'api/tag/tag.model';
import type { IApiBatchResponse } from 'utilites/response';

export interface ITagService
  extends IBaseService<ITagEntity, CreateTagDto, UpdateTagDto> {}

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

  async getAll(
    reqQuery?: IRequestQueryBase
  ): Promise<WithPagination<TagLeanDocument>> {
    return super.getAll(reqQuery, 'creator');
  }

  async deleteOneById(id: string): Promise<DeleteResult> {
    await this.postService.removeIdFromArrayField('tags', id);

    return await super.deleteOneById(id);
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    await this.postService.removeIdsFromArrayField('tags', ids);

    return await super.batchDelete(ids);
  }
}

export default TagService;

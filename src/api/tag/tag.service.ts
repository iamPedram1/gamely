// Models
import Tag from 'api/tag/tag.model';

// DTO
import { UpdateTagDto } from 'api/tag/tag.dto';

// Services
import BaseService from 'services/base';

// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type IRequestQueryBase from 'types/query';
import type { ITagEntity } from 'api/tag/tag.type';
import type { IBaseService } from 'services/base';
import type { WithPagination } from 'types/paginate';
import type { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

export interface ITagService extends IBaseService<TagLeanDocument> {
  update: (tagId: string, data: UpdateTagDto) => Promise<TagDocument | null>;
  create: (
    data: Pick<ITagEntity, 'title' | 'slug'>,
    userId: string
  ) => Promise<TagDocument>;
}

class TagService extends BaseService<ITagEntity> implements ITagService {
  constructor() {
    super(Tag);
  }

  async getAll(
    reqQuery?: IRequestQueryBase
  ): Promise<WithPagination<TagLeanDocument>> {
    return super.getAll(reqQuery, 'creator');
  }

  async create(
    data: Pick<ITagEntity, 'title' | 'slug'>,
    userId: string
  ): Promise<TagDocument> {
    const newTag = await new Tag({ ...data, creator: userId }).save();

    if (!newTag) throw new ValidationError('Tag could not be created');

    return newTag;
  }

  async update(tagId: string, payload: UpdateTagDto) {
    return await Tag.findByIdAndUpdate(
      tagId,
      { ...payload, updatedAt: Date.now() },
      { new: true }
    )
      .populate('creator', 'name email')
      .exec();
  }
}

export default TagService;

import { plainToInstance } from 'class-transformer';

// Models
import Tag from 'api/tag/tag.model';

// DTO
import {
  TagResponseDto,
  TagSummaryResponseDto,
  UpdateTagDto,
} from 'api/tag/tag.dto';

// Services
import BaseService from 'services/Base';

// Utilities
import { ValidationError } from 'utilites/errors';
import type { ITagEntity } from 'api/tag/tag.type';
import type { IBaseService } from 'services/Base';
import type { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

export interface ITagService extends IBaseService<TagLeanDocument> {
  transformToTag: (tag: TagDocument | TagLeanDocument) => TagResponseDto;
  transformToTagSummary: (
    tag: TagDocument | TagLeanDocument
  ) => TagSummaryResponseDto;
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

  transformToTag(tag: TagLeanDocument): TagResponseDto {
    return plainToInstance(TagResponseDto, tag, {
      excludeExtraneousValues: true,
    });
  }

  transformToTagSummary(tag: TagLeanDocument): TagSummaryResponseDto {
    return plainToInstance(TagSummaryResponseDto, tag, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    data: Pick<ITagEntity, 'title' | 'slug'>,
    userId: string
  ): Promise<TagDocument> {
    const tag = await this.checkExistenceBySlug(data.slug);

    if (tag) throw new ValidationError('A tag with given slug already exist');

    const newTag = await new Tag({ ...data, creator: userId }).save();
    if (!newTag) throw new ValidationError('Tag could not be created');

    return newTag;
  }

  async update(tagId: string, payload: UpdateTagDto) {
    return await Tag.findByIdAndUpdate(
      tagId,
      { ...payload, updateDate: Date.now() },
      { new: true }
    )
      .populate('creator', 'name email')
      .exec();
  }
}

export default TagService;

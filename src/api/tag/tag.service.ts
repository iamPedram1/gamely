import { DeleteResult, Query } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import Tag, { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

import { ValidationError } from 'utilites/errors';
import {
  TagResponseDto,
  TagSummaryResponseDto,
  UpdateTagDto,
} from 'api/tag/tag.dto';
import type { ITagProps, TagProps } from 'api/tag/tag.type';
import paginate from 'utilites/pagination';
import { WithPagination } from 'types/paginate';
import RequestQueryBaseProps from 'types/query';

export interface ITagService {
  transformToTag: (tag: TagLeanDocument) => TagResponseDto;
  transformToTagSummary: (tag: TagLeanDocument) => TagSummaryResponseDto;
  getTags: (
    query?: RequestQueryBaseProps
  ) => Promise<WithPagination<TagLeanDocument>>;
  getTagsSummaries: (
    query?: RequestQueryBaseProps
  ) => Promise<WithPagination<TagLeanDocument>>;
  getTagBySlug: (slug: string) => Promise<TagLeanDocument | null>;
  getTagById: (_id: string) => Promise<TagLeanDocument | null>;
  delete: (tagId: string) => Promise<DeleteResult>;
  update: (tagId: string, data: UpdateTagDto) => Promise<TagDocument | null>;
  create: (
    data: Pick<ITagProps, 'title' | 'slug'>,
    userId: string
  ) => Promise<TagDocument>;
}

export default class TagService implements ITagService {
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

  async checkTagExistBySlug(slug: string) {
    return (await Tag.countDocuments({ slug })) > 0;
  }

  async checkTagExistById(_id: string) {
    return (await Tag.countDocuments({ _id })) > 0;
  }

  async getTagBySlug(slug: string) {
    return await Tag.findOne({ slug }).lean();
  }

  async getTags(reqQuery?: RequestQueryBaseProps) {
    const query = Tag.find().populate('creator', '_id name');

    return await paginate(query, reqQuery);
  }

  async getTagsSummaries(reqQuery?: RequestQueryBaseProps) {
    const query = Tag.find().select('_id title slug');

    return await paginate(query, reqQuery);
  }

  async getTagById(_id: string) {
    return await Tag.findOne({ _id }).populate('creator', 'name email').lean();
  }

  async create(
    data: Pick<ITagProps, 'title' | 'slug'>,
    userId: string
  ): Promise<TagDocument> {
    const tag = await this.checkTagExistBySlug(data.slug);

    if (tag) throw new ValidationError('A tag with given slug already exist');

    const newTag = await new Tag({ ...data, creator: userId }).save();
    if (!newTag) throw new ValidationError('Tag could not be created');

    return newTag;
  }

  async delete(tagId: string): Promise<DeleteResult> {
    const deleted = await Tag.deleteOne({ _id: tagId });

    return deleted;
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

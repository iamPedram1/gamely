import { DeleteResult } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import Tag, { TagDocument, TagLeanDocument } from 'api/tag/tag.model';

import { ValidationError } from 'utilites/errors';
import {
  TagResponseDto,
  TagSummaryResponseDto,
  UpdateTagDto,
} from 'api/tag/tag.dto';
import type { ITagProps } from 'api/tag/tag.type';

export interface ITagService {
  getTags: () => Promise<TagLeanDocument[]>;
  getTagsSummaries: () => Promise<TagLeanDocument[]>;
  getTagBySlug: (slug: string) => Promise<TagLeanDocument | null>;
  getTagById: (_id: string) => Promise<TagLeanDocument | null>;
  create: (
    data: Pick<ITagProps, 'title' | 'slug'>,
    userId: string
  ) => Promise<TagResponseDto>;
  delete: (tagId: string) => Promise<DeleteResult>;
  update: (tagId: string, data: UpdateTagDto) => Promise<TagDocument | null>;
}

export default class TagService implements ITagService {
  private transformToTag(tag: TagDocument): TagResponseDto {
    return plainToInstance(TagResponseDto, tag.toObject({ getters: true }), {
      excludeExtraneousValues: true,
    });
  }
  private transformToTagSummary(tag: TagDocument): TagSummaryResponseDto {
    return plainToInstance(
      TagSummaryResponseDto,
      tag.toObject({ getters: true }),
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async getTagBySlug(slug: string) {
    return await Tag.findOne({ slug }).lean();
  }

  async getTags() {
    return await Tag.find().populate('creator', '_id name').lean();
  }

  async checkTagExistBySlug(slug: string) {
    return (await Tag.countDocuments({ slug })) > 0;
  }

  async checkTagExistById(_id: string) {
    return (await Tag.countDocuments({ _id })) > 0;
  }

  async getTagsSummaries() {
    return await Tag.find().lean().select('_id title slug');
  }

  async getTagById(_id: string) {
    return await Tag.findOne({ _id }).populate('creator', 'name email').lean();
  }

  async create(
    data: Pick<ITagProps, 'title' | 'slug'>,
    userId: string
  ): Promise<TagResponseDto> {
    const tag = await this.checkTagExistBySlug(data.slug);

    if (tag)
      throw new ValidationError(
        'A tag with given slug already exist. Tag should be unique'
      );

    const newTag = await new Tag({ ...data, creator: userId }).save();
    if (!newTag) throw new ValidationError('Tag could not be created');

    return this.transformToTag(newTag);
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

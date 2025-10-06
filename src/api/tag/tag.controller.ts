import type { RequestHandler } from 'express';

// Services
import { ITagService } from 'api/tag/tag.service';

// Utilities
import sendResponse from 'utilites/response';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Types
import type { ITagMapper } from 'api/tag/tag.mapper';
import type IRequestQueryBase from 'types/query';

export default class TagController {
  private tagService: ITagService;
  private tagMapper: ITagMapper;

  constructor(tagService: ITagService, tagMapper: ITagMapper) {
    this.tagMapper = tagMapper;
    this.tagService = tagService;
  }

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { docs, pagination } = await this.tagService.getAll(query);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tags',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.tagMapper.toDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.tagService.getAllSummaries(query);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tags',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.tagMapper.toSummaryDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getLeanById(req.params.id);

    sendResponse(res, tag ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Tag',
      body: {
        data: tag ? this.tagMapper.toDto(tag) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateTagDto;
    const tag = await this.tagService.create(dto, req.user._id);

    sendResponse(res, tag ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Tag',
      body: { data: this.tagMapper.toDto(tag) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const tag = await this.tagService.deleteById(req.params.id);
    const deleted = tag.deletedCount > 0;

    sendResponse(res, deleted ? 200 : 400, {
      httpMethod: 'DELETE',
      featureName: 'Tag',
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateTagDto;
    const body = await this.tagService.update(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Tag',
      body: { data: body },
    });
  };
}

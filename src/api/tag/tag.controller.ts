import type { RequestHandler } from 'express';

// Services
import { ITagService } from 'api/tag/tag.service';

// Dto
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Utilities
import sendResponse from 'utilites/response';

// Types
import type RequestQueryBaseProps from 'types/query';
import type { ITagMapper } from 'api/tag/tag.mapper';

export default class TagController {
  private tagService: ITagService;
  private tagMapper: ITagMapper;

  constructor(tagService: ITagService, tagMapper: ITagMapper) {
    this.tagMapper = tagMapper;
    this.tagService = tagService;
  }

  getAll: RequestHandler = async (req, res) => {
    const { docs, pagination } = await this.tagService.getAll(
      req.query as unknown as RequestQueryBaseProps
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tags',
      body: {
        data: {
          pagination: pagination,
          docs: docs.map((tag) => this.tagMapper.toTagDto(tag)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const { pagination, docs } = await this.tagService.getAllSummaries(
      req.query as unknown as RequestQueryBaseProps
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tags',
      body: {
        data: {
          pagination: pagination,
          docs: docs.map((tag) => this.tagMapper.toTagSummaryDto(tag)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getById(req.params.id);

    sendResponse(res, tag ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Tag',
      body: {
        data: tag ? this.tagMapper.toTagDto(tag) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateTagDto;

    const tag = await this.tagService.create(dto, req.user._id);

    sendResponse(res, tag ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Tag',
      body: { data: this.tagMapper.toTagDto(tag) },
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

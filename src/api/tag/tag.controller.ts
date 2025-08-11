import type { RequestHandler } from 'express';
import { ITagService } from 'api/tag/tag.service';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';
import ApiResponse from 'utilites/response';
import RequestQueryBaseProps from 'types/query';

export default class TagController {
  private tagService: ITagService;

  constructor(tagService: ITagService) {
    this.tagService = tagService;
  }

  getAll: RequestHandler = async (req, res) => {
    const { docs, pagination } = await this.tagService.getTags(
      req.query as unknown as RequestQueryBaseProps
    );

    const response = new ApiResponse(
      { status: 200, httpMethod: 'GET', featureName: 'Tags' },
      {
        data: {
          pagination: pagination,
          docs: docs.map((tag) => this.tagService.transformToTag(tag)),
        },
      }
    );

    res.status(200).json(response);
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const { pagination, docs } = await this.tagService.getTagsSummaries(
      req.query as unknown as RequestQueryBaseProps
    );

    const response = new ApiResponse(
      { status: 200, httpMethod: 'GET', featureName: 'Tags' },
      {
        data: {
          pagination: pagination,
          docs: docs.map((tag) => this.tagService.transformToTagSummary(tag)),
        },
      }
    );

    res.status(200).json(response);
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getTagById(req.params.id);

    const response = new ApiResponse(
      { status: tag ? 200 : 400, httpMethod: 'GET', featureName: 'Tag' },
      {
        data: tag ? this.tagService.transformToTag(tag) : null,
      }
    );

    res.status(200).json(response);
  };

  create: RequestHandler = async (req, res) => {
    const dto = new CreateTagDto(req.body);

    const tag = await this.tagService.create(dto, req.user._id);

    const response = new ApiResponse(
      { status: tag ? 201 : 400, featureName: 'Tag', httpMethod: 'POST' },
      { data: this.tagService.transformToTag(tag) }
    );

    res.status(201).json(response);
  };

  delete: RequestHandler = async (req, res) => {
    const tag = await this.tagService.delete(req.params.id);
    const deleted = tag.deletedCount > 0;

    const response = new ApiResponse({
      status: deleted ? 200 : 400,
      httpMethod: 'DELETE',
      featureName: 'Tag',
    });

    if (deleted) res.status(200).json(response);
    else res.status(400).json(response);
  };

  update: RequestHandler = async (req, res) => {
    const dto = new UpdateTagDto(req.body);

    const body = await this.tagService.update(req.params.id, dto);

    const response = new ApiResponse(
      { status: 200, httpMethod: 'PATCH', featureName: 'Tag' },
      { data: body }
    );

    res.status(200).json(response);
  };
}

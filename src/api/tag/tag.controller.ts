import { delay, inject, injectable } from 'tsyringe';

// Services
import TagService from 'api/tag/tag.service';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';

// DTO
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';

// Mapper
import { TagMapper } from 'api/tag/tag.mapper';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'types/query';

@injectable()
export default class TagController {
  constructor(
    @inject(delay(() => TagService)) private tagService: TagService,
    @inject(delay(() => TagMapper)) private tagMapper: TagMapper
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const { docs, pagination } = await this.tagService.find({
      reqQuery,
      lean: true,
    });

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
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const docs = await this.tagService.getWithPostsCount();

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tags',
      body: {
        data: docs.map((doc) => this.tagMapper.toSummaryDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getOneById(req.params.id, { lean: true });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Tag',
      body: {
        data: this.tagMapper.toDto(tag),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateTagDto;
    const tag = await this.tagService.create(dto, req.user._id);

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'Tag',
      body: { data: this.tagMapper.toDto(tag) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.tagService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Tag',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.tagService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Tag',
      body: {
        data: result,
        isSuccess: result.isAllSucceed,
        errors: result.errors,
        message: result.isAllSucceed
          ? 'Batch operation completed successfuly'
          : 'Operation completed with some errors',
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateTagDto;
    const body = await this.tagService.updateOneById(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Tag',
      body: { data: body },
    });
  };
}

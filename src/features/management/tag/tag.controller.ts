import { delay, inject, injectable } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utilities
import sendResponse, { sendBatchResponse } from 'core/utilites/response';

// DTO
import { CreateTagDto, UpdateTagDto } from 'features/management/tag/tag.dto';

// Mapper
import { TagMapper } from 'features/shared/tag/tag.mapper';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class TagManagementController {
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
      featureName: 'models.Tag.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.tagMapper.toManagementDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const docs = await this.tagService.find({ lean: true, paginate: false });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Tag.plural',
      body: {
        data: docs.map((doc) => this.tagMapper.toManagementSummaryDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getOneById(req.params.id, { lean: true });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Tag.singular',
      body: {
        data: this.tagMapper.toManagementDto(tag),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateTagDto;
    const tag = await this.tagService.create(dto, req.user.id);

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Tag.singular',
      body: { data: this.tagMapper.toManagementDto(tag) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.tagService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Tag.singular',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.tagService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Tag.singular',
      body: {
        data: result,
        isSuccess: result.isAllSucceed,
        errors: result.errors,
        message: result.isAllSucceed
          ? req.t('messages.batch.completed')
          : req.t('messages.batch.completed_with_error'),
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateTagDto;
    const body = await this.tagService.updateOneById(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Tag.singular',
      body: { data: body },
    });
  };
}

import { delay, inject, injectable } from 'tsyringe';

// Service
import CategoryService from 'features/shared/category/category.service';

// DTO
import { CategoryMapper } from 'features/shared/category/category.mapper';

// Utilities
import sendResponse from 'core/utilities/response';
import { AnonymousError } from 'core/utilities/errors';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class CategoryManagementController {
  constructor(
    @inject(delay(() => CategoryMapper)) private categoryMapper: CategoryMapper,
    @inject(delay(() => CategoryService))
    private categoryService: CategoryService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.categoryService.find({
      query,
      lean: true,
      populate: [{ path: 'creator', populate: 'avatar' }],
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Category.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.categoryMapper.toManagementDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const docs = await this.categoryService.find({
      query,
      lean: true,
      paginate: false,
      select: 'translations slug',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Category.plural',
      body: {
        data: docs.map((doc) =>
          this.categoryMapper.toManagementSummaryDto(doc)
        ),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const category = await this.categoryService.getOneById(req.params.id, {
      lean: true,
      populate: [{ path: 'creator', populate: 'avatar' }],
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Category.singular',
      body: {
        data: this.categoryMapper.toManagementDto(category),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const category = await this.categoryService.create(req.body, req.user.id, {
      lean: true,
    });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Category.singular',
      body: { data: this.categoryMapper.toManagementDto(category) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.categoryService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Category.singular',
    });
  };

  update: RequestHandler = async (req, res) => {
    const body = await this.categoryService.updateOneById(
      req.params.id,
      req.body
    );

    if (!body)
      throw new AnonymousError(
        'Error in updating category',
        req.t('common.internal_server_error'),
        500
      );

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Category.singular',
      body: { data: this.categoryMapper.toManagementDto(body) },
    });
  };
}

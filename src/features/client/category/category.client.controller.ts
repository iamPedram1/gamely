import { delay, inject, injectable } from 'tsyringe';

// Service
import CategoryService from 'features/shared/category/category.service';

// DTO
import { CategoryMapper } from 'features/shared/category/category.mapper';

// Utilities
import sendResponse from 'core/utilities/response';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class CategoryClientController {
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
          docs: docs.map((doc) => this.categoryMapper.toClientDto(doc)),
        },
      },
    });
  };

  getAllNested: RequestHandler = async (req, res) => {
    const docs = await this.categoryService.getAllNested();

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Category.plural',
      body: { data: docs.map((doc) => this.categoryMapper.toNestedDto(doc)) },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const category = await this.categoryService.getOneBySlug(req.params.slug, {
      lean: true,
      populate: [{ path: 'creator', populate: 'avatar' }],
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Category.singular',
      body: {
        data: this.categoryMapper.toClientDto(category),
      },
    });
  };
}

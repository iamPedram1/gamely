import { delay, inject, injectable } from 'tsyringe';

// Service
import CategoryService from 'api/category/category.service';

// Dto
import { CategoryMapper } from 'api/category/category.mapper';

// Utilities
import sendResponse from 'utilites/response';
import { InternalServerError } from 'utilites/errors';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'types/query';

@injectable()
export default class CategoryController {
  constructor(
    @inject(delay(() => CategoryMapper)) private categoryMapper: CategoryMapper,
    @inject(delay(() => CategoryService))
    private categoryService: CategoryService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.categoryService.find({
      reqQuery,
      lean: true,
      populate: 'creator',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Categories',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.categoryMapper.toDto(doc)),
        },
      },
    });
  };

  getAllNested: RequestHandler = async (req, res) => {
    const docs = await this.categoryService.getAllNested();

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Categories',
      body: { data: docs.map((doc) => this.categoryMapper.toNestedDto(doc)) },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const docs = await this.categoryService.find({
      reqQuery,
      lean: true,
      paginate: false,
      select: 'title slug',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Categories',
      body: {
        data: docs.map((doc) => this.categoryMapper.toSummaryDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const category = await this.categoryService.getOneById(req.params.id, {
      populate: 'creator',
      lean: true,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Category',
      body: {
        data: this.categoryMapper.toDto(category),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const category = await this.categoryService.create(req.body, req.user._id, {
      lean: true,
    });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'Category',
      body: { data: this.categoryMapper.toDto(category) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.categoryService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Category',
    });
  };

  update: RequestHandler = async (req, res) => {
    const body = await this.categoryService.updateOneById(
      req.params.id,
      req.body
    );

    if (!body) throw new InternalServerError('Error in updating category');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Category',
      body: { data: this.categoryMapper.toDto(body) },
    });
  };
}

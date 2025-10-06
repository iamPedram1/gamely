import type { RequestHandler } from 'express';

// Service
import { ICategoryService } from 'api/category/category.service';

// Dto
import { ICategoryMapper } from 'api/category/category.mapper';

// Utilities
import sendResponse from 'utilites/response';
import { ValidationError } from 'utilites/errors';

// Types
import IRequestQueryBase from 'types/query';

export default class CategoryController {
  private categoryService: ICategoryService;
  private categoryMapper: ICategoryMapper;

  constructor(
    categoryService: ICategoryService,
    categoryMapper: ICategoryMapper
  ) {
    this.categoryService = categoryService;
    this.categoryMapper = categoryMapper;
  }

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.categoryService.getAll(query);
    await this.categoryService.getAllNested();
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
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.categoryService.getAllSummaries(
      query,
      'parentId',
      'title slug parentId'
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Categories',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.categoryMapper.toSummaryDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const category = await this.categoryService.getLeanById(
      req.params.id,
      'creator'
    );

    sendResponse(res, category ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Category',
      body: {
        data: category ? this.categoryMapper.toDto(category) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const category = await this.categoryService.create(req.body, req.user._id);

    sendResponse(res, category ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Category',
      body: { data: category ? this.categoryMapper.toDto(category) : null },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const { deletedCount } = await this.categoryService.deleteById(
      req.params.id
    );

    sendResponse(res, deletedCount > 0 ? 200 : 400, {
      httpMethod: 'DELETE',
      featureName: 'Category',
    });
  };

  update: RequestHandler = async (req, res) => {
    const body = await this.categoryService.update(req.params.id, req.body);

    if (!body) throw new ValidationError('Error in updating category');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Category',
      body: { data: this.categoryMapper.toDto(body) },
    });
  };
}

import type { RequestHandler } from 'express';

// Service
import { IPostService } from 'api/post/post.service';

// Dto
import { IPostMapper } from 'api/post/post.mapper';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';
import { ValidationError } from 'utilites/errors';

// Types
import IRequestQueryBase from 'types/query';

export default class PostController {
  private postService: IPostService;
  private postMapper: IPostMapper;

  constructor(postService: IPostService, postMapper: IPostMapper) {
    this.postMapper = postMapper;
    this.postService = postService;
  }

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.postService.getAll(
      query,
      'category game tags creator'
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Posts',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.postMapper.toDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.postService.getAllSummaries(
      query,
      'category game tags'
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Posts',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.postMapper.toSummaryDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const post = await this.postService.getLeanById(
      req.params.id,
      'category game tags'
    );

    sendResponse(res, post ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Post',
      body: {
        data: post ? this.postMapper.toDto(post) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const post = await this.postService.create(req.body, req.user._id);

    sendResponse(res, post ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Post',
      body: { data: post ? this.postMapper.toDto(post) : null },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const post = await this.postService.deleteOneById(req.params.id);
    const deleted = post.deletedCount > 0;

    sendResponse(res, deleted ? 200 : 400, {
      httpMethod: 'DELETE',
      featureName: 'Post',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.postService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Post',
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
    const body = await this.postService.update(req.params.id, req.body);

    if (!body) throw new ValidationError('Error in updating post');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Post',
      body: { data: this.postMapper.toDto(body) },
    });
  };
}

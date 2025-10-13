import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import PostService from 'api/post/post.service';

// Dto
import { PostMapper } from 'api/post/post.mapper';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';
import { ValidationError } from 'utilites/errors';

// Types
import type { IRequestQueryBase } from 'types/query';

@injectable()
export default class PostController {
  constructor(
    @inject(delay(() => PostMapper)) private postMapper: PostMapper,
    @inject(delay(() => PostService)) private postService: PostService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.postService.find({
      reqQuery,
      lean: true,
      populate: [
        { path: 'creator', populate: 'avatar' },
        { path: 'category' },
        { path: 'game' },
        { path: 'tags' },
        { path: 'coverImage' },
      ],
    });

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
    const reqQuery = req.query as unknown as IRequestQueryBase;
    const docs = await this.postService.find({
      reqQuery,
      lean: true,
      paginate: false,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Posts',
      body: {
        data: docs.map((doc) => this.postMapper.toDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const post = await this.postService.getOneById(req.params.id, {
      lean: true,
      populate: [
        { path: 'creator', populate: 'avatar' },
        { path: 'category' },
        { path: 'game' },
        { path: 'tags' },
        { path: 'coverImage' },
      ],
    });

    sendResponse(res, post ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Post',
      body: {
        data: post ? this.postMapper.toDto(post) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const post = await this.postService.create(req.body, req.user._id, {
      lean: true,
      populate: [
        { path: 'creator', populate: 'avatar' },
        { path: 'category' },
        { path: 'game' },
        { path: 'tags' },
        { path: 'coverImage' },
      ],
    });

    sendResponse(res, post ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Post',
      body: { data: post ? this.postMapper.toDto(post) : null },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.postService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
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
    const body = await this.postService.updateOneById(req.params.id, req.body, {
      lean: true,
      populate: [
        { path: 'creator', populate: 'avatar' },
        { path: 'category' },
        { path: 'game' },
        { path: 'tags' },
        { path: 'coverImage' },
      ],
    });

    if (!body) throw new ValidationError('Error in updating post');

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Post',
      body: { data: this.postMapper.toDto(body) },
    });
  };
}

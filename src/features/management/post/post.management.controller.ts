import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import PostService from 'features/shared/post/post.service';

// DTO
import { PostMapper } from 'features/shared/post/post.mapper';

// Utilities
import sendResponse, { sendBatchResponse } from 'core/utilites/response';

// Types
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class PostMangementController {
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
      featureName: 'models.Post.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.postMapper.toClientDto(doc)),
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
      featureName: 'models.Post.plural',
      body: {
        data: docs.map((doc) => this.postMapper.toClientDto(doc)),
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
      featureName: 'models.Post.singular',
      body: {
        data: post ? this.postMapper.toClientDto(post) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const post = await this.postService.create(req.body, req.user.id, {
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
      featureName: 'models.Post.singular',
      body: { data: post ? this.postMapper.toManagementDto(post) : null },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.postService.deleteOneById(req.params.id);

    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Post.singular',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.postService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Post.singular',
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

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Post.singular',
      body: { data: this.postMapper.toManagementDto(body) },
    });
  };
}

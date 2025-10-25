import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import PostService from 'features/shared/post/post.service';

// DTO
import { PostMapper } from 'features/shared/post/post.mapper';

// Utilities
import { postPopulate } from 'features/shared/post/post.constant';
import sendResponse, { sendBatchResponse } from 'core/utilites/response';

// Types
import { PostQueryDto } from 'features/shared/post/post.dto';

@injectable()
export default class PostManagementController {
  constructor(
    @inject(delay(() => PostMapper)) private postMapper: PostMapper,
    @inject(delay(() => PostService)) private postService: PostService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as PostQueryDto;
    const filter = this.postService.buildFilterFromQuery(query, {
      filterBy: [
        { queryKey: 'game', modelKey: 'game', logic: 'and' },
        { queryKey: 'category', modelKey: 'category', logic: 'and' },
        { queryKey: 'tag', modelKey: 'tags', logic: 'and' },
      ],
      searchBy: [
        {
          options: 'i',
          operator: 'or',
          queryKey: 'search',
          modelKeys: ['translations.en.title', 'translations.fa.title'],
        },
      ],
    });

    const { pagination, docs } = await this.postService.find({
      reqQuery: query,
      lean: true,
      populate: postPopulate,
      filter,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Post.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.postMapper.toManagementDto(doc)),
        },
      },
    });
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const reqQuery = req.query as unknown as PostQueryDto;
    const docs = await this.postService.find({
      reqQuery,
      lean: true,
      paginate: false,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Post.plural',
      body: {
        data: docs.map((doc) => this.postMapper.toManagementSummaryDto(doc)),
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const post = await this.postService.getOneById(req.params.id, {
      lean: true,
      populate: postPopulate,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Post.singular',
      body: {
        data: this.postMapper.toManagementDto(post),
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const post = await this.postService.create(req.body, req.user.id, {
      lean: true,
    });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Post.singular',
      body: { data: this.postMapper.toManagementDto(post) },
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
    const post = await this.postService.updateOneById(req.params.id, req.body, {
      lean: true,
      populate: postPopulate,
    });

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Post.singular',
      body: { data: this.postMapper.toManagementDto(post) },
    });
  };
}

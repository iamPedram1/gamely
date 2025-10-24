import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import PostService from 'features/shared/post/post.service';

// Dto
import { PostMapper } from 'features/shared/post/post.mapper';

// Utilities
import sendResponse from 'core/utilites/response';

// Types
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class PostClientController {
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
          docs: docs.map((doc) => this.postMapper.toPublicDto(doc)),
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
        data: docs.map((doc) => this.postMapper.toPublicSummaryDto(doc)),
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
        data: post ? this.postMapper.toPublicDto(post) : null,
      },
    });
  };
}

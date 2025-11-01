import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Models
import Tag from 'features/shared/tag/tag.model';
import Game from 'features/shared/game/core/game.model';
import Category from 'features/shared/category/category.model';

// Service
import PostService from 'features/shared/post/core/post.service';

// DTO
import { PostMapper } from 'features/shared/post/core/post.mapper';

// Utilities
import sendResponse from 'core/utilities/response';
import { postPopulate } from 'features/shared/post/core/post.constant';

// Types
import { mapSlugToId } from 'core/utilities/filter';
import { PostClientQueryDto } from 'features/client/post/core/post.client.dto';

@injectable()
export default class PostClientController {
  constructor(
    @inject(delay(() => PostMapper)) private postMapper: PostMapper,
    @inject(delay(() => PostService)) private postService: PostService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as PostClientQueryDto;
    const filter = await this.postService.buildFilterFromQuery(query, {
      filterBy: [
        {
          queryKey: 'game',
          modelKey: 'game',
          transform: mapSlugToId(Game),
        },
        {
          queryKey: 'tag',
          modelKey: 'tags',
          transform: mapSlugToId(Tag),
        },
        {
          queryKey: 'category',
          modelKey: 'category',
          transform: mapSlugToId(Category),
        },
        { queryKey: 'creator', modelKey: 'creator' },
      ],
      searchBy: [
        {
          queryKey: 'search',
          modelKeys: ['translations.en.title', 'translations.fa'],
          operator: 'or',
        },
      ],
    });

    const { pagination, docs } = await this.postService.find({
      query,
      filter,
      lean: true,
      populate: postPopulate,
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

  getOne: RequestHandler = async (req, res) => {
    const post = await this.postService.getOneBySlug(req.params.slug, {
      lean: true,
      populate: postPopulate,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Post.singular',
      body: {
        data: this.postMapper.toClientDto(post),
      },
    });
  };
}

import { delay, inject, injectable } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utilities
import sendResponse from 'core/utilites/response';

// Mapper
import { TagMapper } from 'features/shared/tag/tag.mapper';

// Types
import type { RequestHandler } from 'express';
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class TagClientController {
  constructor(
    @inject(delay(() => TagService)) private tagService: TagService,
    @inject(delay(() => TagMapper)) private tagMapper: TagMapper
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as IRequestQueryBase;
    const { docs, pagination } = await this.tagService.findWithRelatedCounts(
      [
        {
          from: 'posts',
          localField: '_id',
          foreignField: 'tags',
          asField: 'postsCount',
        },
      ],
      { lean: true }
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Tag.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((doc) => this.tagMapper.toClientDto(doc)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getOneBySlug(req.params.slug, {
      lean: true,
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Tag.singular',
      body: {
        data: this.tagMapper.toClientDto(tag),
      },
    });
  };
}

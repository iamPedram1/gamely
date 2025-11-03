import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Services
import CommentService from 'features/shared/post/comment/comment.service';

// Utilities
import sendResponse from 'core/utilities/response';

// Mapper
import { CommentMapper } from 'features/shared/post/comment/comment.mapper';

// DTO
import { CreateCommentDto } from 'features/client/post/comment/comment.client.dto';

// Types
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class CommentClientController {
  constructor(
    @inject(delay(() => CommentMapper)) private commentMapper: CommentMapper,
    @inject(delay(() => CommentService)) private commentService: CommentService
  ) {}

  getComments: RequestHandler = async (req, res) => {
    const postId = req.params.id as string;
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.commentService.getPostComments(
      postId,
      query
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Comment.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((item) => this.commentMapper.toClientDto(item)),
        },
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateCommentDto;

    const comment = await this.commentService.create({
      ...dto,
      parentIds: [],
      post: req.params.id,
    });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Comment.singular',
      body: {
        data: this.commentMapper.toClientDto(comment),
        message: req.t('messages.comment.create_success'),
      },
    });
  };
}

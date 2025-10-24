import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Services
import CommentService from 'features/shared/comment/comment.service';

// Utilities
import sendResponse from 'core/utilites/response';

// Mapper
import { CommentMapper } from 'features/shared/comment/comment.mapper';

// DTO
import { CreateCommentDto } from 'features/client/comment/comment.client.dto';

// Types
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class CommentClientController {
  constructor(
    @inject(delay(() => CommentMapper)) private commentMapper: CommentMapper,
    @inject(delay(() => CommentService)) private commentService: CommentService
  ) {}

  getApprovedPostComments: RequestHandler = async (req, res) => {
    const id = req.params.id as string;
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } =
      await this.commentService.getPostApprovedComments(id);

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

    const comment = await this.commentService.create(
      { ...dto, postId: req.params.id },
      req.user.id
    );

    sendResponse(res, comment ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'models.Comment.singular',
      body: { data: this.commentMapper.toClientDto(comment) },
    });
  };
}

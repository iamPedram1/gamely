import type { RequestHandler } from 'express';

// Services
import { ICommentService } from 'api/comment/comment.service';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';

// DTO
import { CreateCommentDto, UpdateCommentDto } from 'api/comment/comment.dto';

// Types
import type { ICommentMapper } from 'api/comment/comment.mapper';
import type IRequestQueryBase from 'types/query';

export default class CommentController {
  private commentService: ICommentService;
  private commentMapper: ICommentMapper;

  constructor(commentService: ICommentService, commentMapper: ICommentMapper) {
    this.commentMapper = commentMapper;
    this.commentService = commentService;
  }

  getPostComments: RequestHandler = async (req, res) => {
    const id = req.params.id as string;
    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.commentService.getPostComments(
      id,
      query
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Comments',
      body: {
        data: {
          pagination,
          docs: docs.map((item) => this.commentMapper.toDto(item)),
        },
      },
    });
  };

  getOne: RequestHandler = async (req, res) => {
    const comment = await this.commentService.getOneById(req.params.id, {
      lean: true,
    });

    sendResponse(res, comment ? 200 : 400, {
      httpMethod: 'GET',
      featureName: 'Comment',
      body: {
        data: comment ? this.commentMapper.toDto(comment) : null,
      },
    });
  };

  create: RequestHandler = async (req, res) => {
    const dto = req.body as CreateCommentDto;

    const comment = await this.commentService.create(
      { ...dto, postId: req.params.id },
      req.user._id
    );

    sendResponse(res, comment ? 201 : 400, {
      httpMethod: 'POST',
      featureName: 'Comment',
      body: { data: this.commentMapper.toDto(comment) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const comment = await this.commentService.deleteOneById(req.params.id);
    const deleted = comment.deletedCount > 0;

    sendResponse(res, deleted ? 200 : 400, {
      httpMethod: 'DELETE',
      featureName: 'Comment',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.commentService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'Comment',
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
    const dto = req.body as UpdateCommentDto;
    const body = await this.commentService.updateOneById(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'Comment',
      body: { data: body },
    });
  };
}

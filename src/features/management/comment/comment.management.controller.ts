import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Services
import CommentService from 'features/shared/comment/comment.service';

// Utilities
import sendResponse, { sendBatchResponse } from 'core/utilities/response';

// Mapper
import { CommentMapper } from 'features/shared/comment/comment.mapper';

// DTO
import {
  CommentManagementQueryDto,
  UpdateCommentDto,
} from 'features/management/comment/comment.management.dto';

// Types
import type { IRequestQueryBase } from 'core/types/query';

@injectable()
export default class CommentManagementController {
  constructor(
    @inject(delay(() => CommentMapper)) private commentMapper: CommentMapper,
    @inject(delay(() => CommentService)) private commentService: CommentService
  ) {}

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as CommentManagementQueryDto;
    const filter = await this.commentService.buildFilterFromQuery(query, {
      searchBy: [{ queryKey: 'search', modelKeys: ['message'], options: 'i' }],
      filterBy: [
        { queryKey: 'status', modelKey: 'status', logic: 'and' },
        { queryKey: 'post', modelKey: 'postId', logic: 'or' },
        { queryKey: 'user', modelKey: 'creator', logic: 'or' },
      ],
    });
    const { pagination, docs } = await this.commentService.find({
      lean: true,
      filter,
      populate: [
        { path: 'postId', select: '_id translations' },
        { path: 'creator', select: 'name status type' },
      ],
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Comment.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((item) => this.commentMapper.toManagementDto(item)),
        },
      },
    });
  };

  getPostComments: RequestHandler = async (req, res) => {
    const id = req.params.id as string;

    const query = req.query as unknown as IRequestQueryBase;
    const { pagination, docs } = await this.commentService.getPostComments(
      id,
      query
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Comment.plural',
      body: {
        data: {
          pagination,
          docs: docs.map((item) => this.commentMapper.toManagementDto(item)),
        },
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateCommentDto;
    const body = await this.commentService.updateOneById(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.Comment.singular',
      body: { data: this.commentMapper.toManagementDto(body) },
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.commentService.deleteOneById(req.params.id);
    sendResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Comment.singular',
    });
  };

  batchDelete: RequestHandler = async (req, res) => {
    const result = await this.commentService.batchDelete(req.body.ids);

    sendBatchResponse(res, 200, {
      httpMethod: 'DELETE',
      featureName: 'models.Comment.singular',
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
}

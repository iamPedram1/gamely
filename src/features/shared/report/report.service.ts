import { delay, inject, singleton } from 'tsyringe';

// Models
import Report from 'features/shared/report/report.model';

// DTO
import { CreateReportDto } from 'features/shared/report/report.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/user.service';
import PostService from 'features/shared/post/post.service';
import CommentService from 'features/shared/comment/comment.service';

// Utilities
import { BadRequestError, ValidationError } from 'core/utilities/errors';

// Types
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';
import type {
  IReportEntity,
  ReportDocument,
  ReportStatusType,
  ReportType,
} from 'features/shared/report/report.types';
import { Document, Types } from 'mongoose';

export type IReportService = InstanceType<typeof ReportService>;

@singleton()
class ReportService extends BaseService<IReportEntity> {
  constructor(
    @inject(delay(() => PostService)) private readonly postService: PostService,
    @inject(delay(() => UserService)) private readonly userService: UserService,
    @inject(delay(() => CommentService))
    private readonly commentService: CommentService
  ) {
    super(Report);
  }

  async getReports<
    TLean extends boolean = false,
    TPaginate extends boolean = true,
  >(
    options?:
      | (BaseQueryOptions<IReportEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<IReportEntity, TLean, TPaginate>> {
    const reports = await this.find({
      ...options,
      lean: true,
      populate: 'user',
    });

    // Group report IDs by type
    const postIds: string[] = [];
    const commentIds: string[] = [];
    const userIds: string[] = [];

    for (const report of Array.isArray(reports) ? reports : reports.docs) {
      if (report.type === 'post') postIds.push(report.targetId.toHexString());
      else if (report.type === 'comment')
        commentIds.push(report.targetId.toHexString());
      else if (report.type === 'user')
        userIds.push(report.targetId.toHexString());
    }

    const [posts, comments, users] = await Promise.all([
      postIds.length
        ? this.postService.find({
            filter: { _id: { $in: postIds } },
            lean: true,
            paginate: false,
            populate: 'creator',
          })
        : [],
      commentIds.length
        ? this.commentService.find({
            filter: { _id: { $in: commentIds } },
            paginate: false,
            lean: true,
            populate: 'creator',
          })
        : [],
      userIds.length
        ? this.userService.find({
            filter: { _id: { $in: userIds } },
            paginate: false,
            lean: true,
          })
        : [],
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const postMap = new Map(posts.map((p) => [p._id.toString(), p]));
    const commentMap = new Map(comments.map((c) => [c._id.toString(), c]));

    const populated = (Array.isArray(reports) ? reports : reports.docs).map(
      (report) => {
        switch (report.type) {
          case 'post':
            return {
              ...report,
              target: postMap.get(report.targetId.toHexString()),
            };
          case 'comment':
            return {
              ...report,
              target: commentMap.get(report.targetId.toHexString()),
            };
          case 'user':
            return {
              ...report,
              target: userMap.get(report.targetId.toHexString()),
            };
          default:
            return report;
        }
      }
    );

    return (
      Array.isArray(reports)
        ? reports
        : { pagination: reports.pagination, docs: populated }
    ) as FindResult<IReportEntity, TLean, TPaginate>;
  }

  async report(data: CreateReportDto, options?: BaseMutateOptions) {
    const [isTargetExist, isReportingSelf, isAlreadyReported] =
      await Promise.all([
        this.checkTargetExistance(data.targetId, data.type),
        this.checkIsReportingSelf(data.targetId, data.type),
        this.checkIsAlreadyReported(data.targetId),
      ]);

    if (!isTargetExist)
      throw new ValidationError(this.t('error.report.target_not_exist'));

    if (isReportingSelf)
      throw new ValidationError(this.t('error.report.report_self'));

    if (isAlreadyReported)
      throw new ValidationError(this.t('error.report.already_reported'));

    return super.create({ ...data, user: this.currentUser.id }, options);
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatusType,
    options?: BaseMutateOptions
  ) {
    return super.updateOneById(reportId, { status }, options);
  }

  private async checkTargetExistance(
    targetId: string,
    type: ReportType
  ): Promise<boolean> {
    switch (type) {
      case 'comment':
        return await this.commentService.existsById(targetId);
      case 'post':
        return await this.postService.existsById(targetId);
      case 'user':
        return await this.userService.existsById(targetId);
      default:
        throw new BadRequestError(`Unhandled report type: ${type}`);
    }
  }

  private async checkIsReportingSelf(
    targetId: string,
    type: ReportType
  ): Promise<boolean> {
    switch (type) {
      case 'comment':
        const comment = await this.commentService.getOneById(targetId, {
          lean: true,
        });
        return this.currentUser.id === comment.creator._id.toHexString();
      case 'post':
        const post = await this.postService.getOneById(targetId, {
          lean: true,
        });
        return this.currentUser.id === post.creator._id.toHexString();
      case 'user':
        return this.currentUser.id === targetId;
      default:
        throw new BadRequestError(`Unhandled report type: ${type}`);
    }
  }

  private async checkIsAlreadyReported(targetId: string) {
    return this.existsByCondition({
      user: this.currentUser.id,
      targetId,
    });
  }
}

export default ReportService;

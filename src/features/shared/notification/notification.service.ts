import { delay, inject, injectable } from 'tsyringe';
import BaseService from 'core/services/base/base.service';
import CommentService from 'features/shared/comment/comment.service';
import Notification from 'features/shared/notification/notification.model';

// DTO
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from 'features/shared/notification/notification.dto';

// Utilities
import { AnonymousError } from 'core/utilities/errors';

// Types
import type { BaseQueryDto } from 'core/dto/query';
import type { DocumentId } from 'core/types/common';
import type { AppLanguages } from 'core/types/i18n';
import type { WithPagination } from 'core/types/paginate';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { ICommentPopulated } from 'features/shared/comment/comment.types';
import type {
  INotificationEntity,
  NotificationLeanDocument,
  NotificationType,
} from 'features/shared/notification/notification.types';

@injectable()
export default class NotificationService extends BaseService<
  INotificationEntity,
  CreateNotificationDto<any>,
  UpdateNotificationDto
> {
  constructor(
    @inject(delay(() => CommentService))
    private commentService: CommentService
  ) {
    super(Notification);
  }

  async getNotifications(
    query: BaseQueryDto
  ): Promise<WithPagination<NotificationLeanDocument>> {
    const notifications = await this.find({
      query,
      lean: true,
      filter: { receiverId: this.currentUser.id },
    });

    const cache = new Map<string, ICommentPopulated>();

    notifications.docs = await Promise.all(
      notifications.docs.map(async (notification) => {
        const comment = await this.getCommentById(notification, cache);
        const message = this.resolveMessage(comment, notification);

        return { ...notification, message, post: comment.postId };
      })
    );

    return notifications;
  }

  async deletePostAllNotification(
    postId: DocumentId,
    options?: Pick<BaseMutateOptions<true>, 'session'>
  ) {
    await this.deleteManyWithConditions(
      {
        'metadata.parentType': 'Post',
        'metadata.parentId': postId,
      },
      options
    );
  }

  async seenNotification(
    id: DocumentId,
    options?: Pick<BaseMutateOptions<true>, 'session'>
  ): Promise<void> {
    await this.updateOneById(id, { seen: true }, { ...options, lean: true });
  }

  async seenAllNotifications(
    options?: Pick<BaseMutateOptions<true>, 'session'>
  ): Promise<void> {
    await this.updateManyByKey(
      'receiverId',
      this.currentUser.id,
      { seen: true },
      options
    );
  }

  async deleteNotification(
    id: DocumentId,
    options?: Pick<BaseMutateOptions<true>, 'session'>
  ): Promise<void> {
    await this.deleteOneById(id, options);
  }

  async deleteAllNotifications(
    options?: Pick<BaseMutateOptions<true>, 'session'>
  ): Promise<void> {
    await this.deleteManyByKey('receiverId', this.currentUser.id, options);
  }

  async createCommentReplyNotification<TThrowError extends boolean = true>(
    comment: ICommentPopulated,
    options?: BaseMutateOptions<boolean> & { throwError?: TThrowError }
  ): Promise<void> {
    if (!comment.replyToCommentId) return;

    const notify =
      new CreateNotificationDto<'messages.notification.comment_reply'>();

    notify.type = 'reply';
    notify.senderId = String(comment.creator._id);
    notify.receiverId = String(comment.replyToCommentId.creator._id);
    notify.messageKey = 'messages.notification.comment_reply';
    notify.metadata = {
      parentType: 'Post',
      parentId: comment.postId._id,
      sourceType: 'Comment',
      sourceId: comment.replyToCommentId._id,
    };

    await this.create(notify, options);
  }

  private resolveMessage(
    comment: ICommentPopulated,
    notification: INotificationEntity
  ) {
    switch (notification.type as NotificationType) {
      case 'reply':
        return this.resolveReplyMessage(comment, notification);
      default:
        return this.t(notification.messageKey);
    }
  }

  private async getCommentById(
    notification: INotificationEntity,
    cache: Map<string, ICommentPopulated>
  ) {
    const commentId = String(notification.metadata.sourceId);
    if (!commentId)
      throw new AnonymousError('Something went wrong in notification metadata');

    let comment = cache.get(commentId);

    if (!comment) {
      comment = (await this.commentService.getOneById(commentId, {
        lean: true,
        populate: [
          { path: 'postId', select: '_id translations slug' },
          { path: 'creator' },
        ],
      })) as unknown as ICommentPopulated;

      cache.set(commentId, comment);
    }
    return comment;
  }

  private resolveReplyMessage(
    comment: ICommentPopulated,
    notification: INotificationEntity
  ) {
    return this.t(notification.messageKey, {
      username: comment.creator.username,
      postTitle:
        comment.postId.translations[this.i18n.language as AppLanguages].title,
    });
  }
}

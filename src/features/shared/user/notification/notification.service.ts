import { delay, inject, injectable } from 'tsyringe';

// Services
import BaseService from 'core/services/base/base.service';
import PostService from 'features/shared/post/core/post.service';
import UserService from 'features/shared/user/core/user.service';
import FollowService from 'features/shared/user/follow/follow.service';
import CommentService from 'features/shared/post/comment/comment.service';
import Notification from 'features/shared/user/notification/notification.model';

// DTO
import { CreateNotificationDto } from 'features/shared/user/notification/notification.dto';

// Utilities
import { AnonymousError } from 'core/utilities/errors';

// Types
import type { BaseQueryDto } from 'core/dto/query';
import type { DocumentId } from 'core/types/common';
import type { AppLanguages } from 'core/types/i18n';
import type { WithPagination } from 'core/types/paginate';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { UserLeanDocument } from 'features/shared/user/core/user.types';
import type { ICommentPopulated } from 'features/shared/post/comment/comment.types';
import type {
  PostLeanDocument,
  PostPopulatedDocument,
} from 'features/shared/post/core/post.types';
import type {
  INotificationEntity,
  NotificationLeanDocument,
  NotificationType,
} from 'features/shared/user/notification/notification.types';

type PostCacheMap = Map<string, PostLeanDocument>;
type UserCacheMap = Map<string, UserLeanDocument>;
type CommentCacheMap = Map<string, ICommentPopulated>;

@injectable()
export default class NotificationService extends BaseService<INotificationEntity> {
  constructor(
    @inject(delay(() => CommentService))
    private commentService: CommentService,
    @inject(delay(() => PostService))
    private postService: PostService,
    @inject(delay(() => FollowService))
    private followService: FollowService,
    @inject(delay(() => UserService))
    private userService: UserService
  ) {
    super(Notification);
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

  async sendCommentReplyNotify<TThrowError extends boolean = true>(
    comment: ICommentPopulated,
    options?: BaseMutateOptions<boolean> & { throwError?: TThrowError }
  ): Promise<void> {
    if (!comment.replyToCommentId) return;

    const notify =
      new CreateNotificationDto<'messages.notification.comment_reply'>();

    notify.type = 'comment-reply';
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

  async sendPostReplyNotify<TThrowError extends boolean = true>(
    comment: ICommentPopulated,
    options?: BaseMutateOptions<boolean> & { throwError?: TThrowError }
  ): Promise<void> {
    if (!comment.replyToCommentId) return;

    const notify =
      new CreateNotificationDto<'messages.notification.post_reply'>();

    notify.type = 'post-reply';
    notify.senderId = String(comment.creator._id);
    notify.receiverId = String(comment.postId.creator._id);
    notify.messageKey = 'messages.notification.post_reply';
    notify.metadata = {
      sourceType: 'Comment',
      sourceId: comment._id,
    };

    await this.create(notify, options);
  }

  async sendPostNotifyToFollowers<TThrowError extends boolean = true>(
    postId: DocumentId,
    userId: DocumentId,
    options?: BaseMutateOptions<boolean> & { throwError?: TThrowError }
  ): Promise<void> {
    if (!postId || !userId) return;

    const followers = await this.followService.getFollowers(
      this.currentUser.id,
      { paginate: false, lean: true, select: 'user' }
    );

    const batch = followers.map((flw) => ({
      type: 'new-post',
      senderId: this.currentUser.id,
      receiverId: flw.user._id,
      messageKey: 'messages.notification.post_created',
      metadata: { sourceType: 'Post', sourceId: postId },
    }));

    return await this.withTransaction(async (session) => {
      await Notification.insertMany(batch, { session });
    }, options?.session);
  }

  async getNotifications(
    query: BaseQueryDto
  ): Promise<WithPagination<NotificationLeanDocument>> {
    const notifications = await this.find({
      query,
      lean: true,
      filter: { receiverId: this.currentUser.id },
    });

    const userCache = new Map<string, UserLeanDocument>();
    const postCache = new Map<string, PostLeanDocument>();
    const commentCache = new Map<string, ICommentPopulated>();

    notifications.docs = await Promise.all(
      notifications.docs.map(async (notification) => {
        return {
          ...notification,
          message: await this.resolveMessage(
            notification,
            userCache,
            postCache,
            commentCache
          ),
        };
      })
    );

    return notifications;
  }

  private async resolveMessage(
    notification: INotificationEntity,
    userCache: UserCacheMap,
    postCache: PostCacheMap,
    commentCache: CommentCacheMap
  ) {
    switch (notification.type as NotificationType) {
      case 'post-reply':
        return await this.resolvePostReplyMessage(notification, commentCache);
      case 'new-post':
        return await this.resolveNewPostMessage(notification, postCache);
      case 'comment-reply':
        return await this.resolveCommentReplyMessage(
          notification,
          commentCache
        );
      default:
        return this.t(notification.messageKey);
    }
  }

  private async getCommentById(
    commentId: string,
    cache: Map<string, ICommentPopulated>
  ) {
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

  private async getUserById(userId: string, userCache: UserCacheMap) {
    if (!userId)
      throw new AnonymousError('Something went wrong in notification metadata');

    let user = userCache.get(userId);

    if (!user) {
      user = await this.userService.getOneById(userId, {
        lean: true,
        select: 'username',
      });

      userCache.set(userId, user);
    }
    return user;
  }

  private async getPostById(postId: string, postCache: PostCacheMap) {
    if (!postId)
      throw new AnonymousError('Something went wrong in notification metadata');

    let post = postCache.get(postId);

    if (!post) {
      post = await this.postService.getOneById(postId, {
        lean: true,
        populate: [{ path: 'creator', select: 'username' }],
      });
      postCache.set(postId, post);
    }

    return post as PostPopulatedDocument;
  }

  private async resolveNewPostMessage(
    notification: INotificationEntity,
    postCacheMap: PostCacheMap
  ) {
    const post = await this.getPostById(
      notification.metadata.sourceId.toHexString(),
      postCacheMap
    );

    return this.t(notification.messageKey, {
      postTitle: post.translations[this.i18n.language as AppLanguages].title,
      username: post.creator.username,
    });
  }

  private async resolveCommentReplyMessage(
    notification: INotificationEntity,
    commentCache: CommentCacheMap
  ) {
    const comment = await this.getCommentById(
      notification.metadata.sourceId.toHexString(),
      commentCache
    );
    return this.t(notification.messageKey, {
      username: comment.creator.username,
      postTitle:
        comment.postId.translations[this.i18n.language as AppLanguages].title,
    });
  }

  private async resolvePostReplyMessage(
    notification: INotificationEntity,
    commentCache: CommentCacheMap
  ) {
    const comment = await this.getCommentById(
      notification.metadata.sourceId.toHexString(),
      commentCache
    );
    return this.t(notification.messageKey, {
      username: comment.creator.username,
      postTitle:
        comment.postId.translations[this.i18n.language as AppLanguages].title,
    });
  }
}

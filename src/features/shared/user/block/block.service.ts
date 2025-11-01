import { delay, inject, injectable } from 'tsyringe';

// Models
import Block from 'features/shared/user/block/block.model';

// DTO
import { CreateBlockDto } from 'features/shared/user/block/block.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/core/user.service';
import FollowService from 'features/shared/user/follow/follow.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type { IBlockEntity } from 'features/shared/user/block/block.types';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';

export type IBlockService = InstanceType<typeof BlockService>;

@injectable()
class BlockService extends BaseService<IBlockEntity> {
  constructor(
    @inject(delay(() => FollowService))
    private followService: FollowService,
    @inject(delay(() => UserService))
    private userService: UserService
  ) {
    super(Block);
  }
  async block(targetId: string, options?: BaseMutateOptions): Promise<void> {
    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.block.block_self'));

    if (await this.checkIsBlock(this.currentUser.id, targetId))
      throw new ValidationError(this.t('error.block.already_blocked'));

    const block = new CreateBlockDto();
    block.user = this.currentUser.id;
    block.blocked = targetId;

    return await this.withTransaction(async (session) => {
      await Promise.all([
        this.create(block, { session }),
        this.userService.adjustBlocksCount(block.user, 1, { session }),
        // Unfollow both way
        this.followService.unfollow(block.user, targetId, { session }),
        this.followService.unfollow(targetId, block.user, { session }),
      ]);
    }, options?.session);
  }

  async unblock(targetId: string, options?: BaseMutateOptions): Promise<void> {
    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.block.unblock_self'));

    const follow = new CreateBlockDto();
    follow.user = this.currentUser.id;
    follow.blocked = targetId;

    const record = await this.getOneByCondition(follow, { throwError: false });

    if (!record) throw new ValidationError(this.t('error.block.not_blocked'));

    return await this.withTransaction(async (session) => {
      await Promise.all([
        record.deleteOne({ session }),
        this.userService.adjustBlocksCount(record.user._id, -1, { session }),
      ]);
    }, options?.session);
  }

  async getBlockList<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    userId: DocumentId,
    options?:
      | (BaseQueryOptions<IBlockEntity, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<IBlockEntity, TLean, TPaginate>> {
    const { search, ...otherQueries } = options?.query || {};
    const blocks = await this.find({
      filter: { user: userId },
      lean: true,
      select: 'createdAt blocked',
      populate: [
        {
          path: 'blocked',
          select: 'username',
          match: search ? { username: new RegExp(search, 'i') } : {},
        },
      ],
      ...options,
      query: otherQueries,
    });

    return (
      Array.isArray(blocks)
        ? blocks.filter((doc) => doc.blocked)
        : {
            pagination: blocks.pagination,
            docs: blocks.docs.filter((doc) => doc.blocked),
          }
    ) as any;
  }

  async checkIsBlock(actorId: DocumentId, blockedUserId: DocumentId) {
    if (actorId === blockedUserId) return false;
    return await this.existsByCondition({
      user: { $eq: actorId },
      blocked: { $eq: blockedUserId },
    });
  }
}

export default BlockService;

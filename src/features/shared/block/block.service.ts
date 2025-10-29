import { injectable } from 'tsyringe';

// Models
import UserBlock from 'features/shared/block/block.model';

// DTO
import { CreateBlockDto } from 'features/shared/block/block.dto';

// Services
import BaseService from 'core/services/base/base.service';

// Utilities
import { ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';
import type {
  IBlockEntity,
  BlockDocument,
} from 'features/shared/block/block.types';

export type IBlockService = InstanceType<typeof BlockService>;

@injectable()
class BlockService extends BaseService<
  IBlockEntity,
  CreateBlockDto,
  null,
  BlockDocument
> {
  constructor() {
    super(UserBlock);
  }

  async block(targetId: string, options?: BaseMutateOptions): Promise<void> {
    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.userBlock.block_self'));

    if (await this.checkIsBlock(this.currentUser.id, targetId))
      throw new ValidationError(this.t('error.userBlock.already_blocked'));

    const follow = new CreateBlockDto();
    follow.user = this.currentUser.id;
    follow.blocked = targetId;

    await this.create(follow, options);
  }

  async unblock(targetId: string, options?: BaseMutateOptions): Promise<void> {
    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.userBlock.unblock_self'));

    const follow = new CreateBlockDto();
    follow.user = this.currentUser.id;
    follow.blocked = targetId;

    const record = await this.getOneByCondition(follow, { throwError: false });

    if (!record)
      throw new ValidationError(this.t('error.userBlock.not_blocked'));

    await record.deleteOne({ session: options?.session });
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
  ): Promise<FindResult<IBlockEntity, BlockDocument, TLean, TPaginate>> {
    const followers = await this.find({
      filter: { user: userId },
      lean: true,
      select: 'createdAt blocked',
      populate: 'blocked',
      ...options,
    });

    return followers;
  }

  async checkIsBlock(userId: DocumentId, blockedUserId: DocumentId) {
    return await this.existsByCondition({
      user: { $eq: userId },
      blocked: { $eq: blockedUserId },
    });
  }
}

export default BlockService;

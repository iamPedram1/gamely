import { delay, inject, injectable } from 'tsyringe';

// Models
import Ban from 'features/management/user/ban/ban.model';

// DTO
import { CreateBanDto } from 'features/management/user/ban/ban.dto';

// Services
import BaseService from 'core/services/base/base.service';
import UserService from 'features/shared/user/core/user.service';

// Utilities
import { ForbiddenError, ValidationError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type { IBanEntity } from 'features/management/user/ban/ban.types';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
} from 'core/types/base.service.type';

export type IUserBanService = InstanceType<typeof UserBanService>;

@injectable()
class UserBanService extends BaseService<IBanEntity> {
  constructor(
    @inject(delay(() => UserService))
    private userService: UserService
  ) {
    super(Ban);
  }
  async ban(
    targetId: string,
    data: CreateBanDto,
    options?: BaseMutateOptions
  ): Promise<void> {
    const targetUser = await this.userService.getOneById(targetId, {
      lean: true,
      select: 'role',
    });

    if (
      ['superAdmin', 'admin'].includes(targetUser.role) &&
      this.currentUser.isNot('superAdmin')
    )
      throw new ForbiddenError();

    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.ban.ban_self'));

    if (await this.checkIsBanned(targetId))
      throw new ValidationError(this.t('error.ban.already_banned'));

    this.create(
      { ...data, status: 'active', user: targetId, actor: this.currentUser.id },
      options
    );
  }

  async unban(targetId: string, options?: BaseMutateOptions): Promise<void> {
    if (this.currentUser.id === targetId)
      throw new ValidationError(this.t('error.ban.unban_self'));

    const record = await this.getUserBan(targetId);

    if (!record) throw new ValidationError(this.t('error.ban.not_banned'));

    await record.deleteOne(options);
  }

  async getBanList<
    TLean extends boolean = true,
    TPaginate extends boolean = true,
  >(
    options?: BaseQueryOptions<IBanEntity, boolean> & {
      lean?: TLean | undefined;
      paginate?: TPaginate | undefined;
    }
  ): Promise<FindResult<IBanEntity, TLean, TPaginate>> {
    const { search, ...otherQueries } = options?.query || {};

    const bans = await this.find({
      lean: true,
      populate: [
        {
          path: 'user',
          match: search ? { username: new RegExp(search, 'i') } : {},
        },
        {
          path: 'actor',
          match: search ? { username: new RegExp(search, 'i') } : {},
        },
      ],
      ...options,
      query: otherQueries,
    });

    return (
      Array.isArray(bans)
        ? bans.filter((doc) => doc.user)
        : {
            pagination: bans.pagination,
            docs: bans.docs.filter((doc) => doc.user),
          }
    ) as any;
  }

  async getUserBan(id: DocumentId) {
    const ban = await this.getOneByCondition(
      { user: id, status: 'active' },
      { throwError: false }
    );

    if (!ban) return null;

    if (this.checkIsBanExpired(ban)) {
      ban.status = 'expired';
      await ban.save();
    }

    return ban;
  }

  private checkIsBanExpired(ban: IBanEntity) {
    return ban.type === 'temporary' && ban.endAt && ban.endAt < new Date();
  }

  async checkIsBanned(banedUserId: DocumentId) {
    const ban = await this.getUserBan(banedUserId);
    if (!ban || ban.status === 'expired') return false;
    else return true;
  }
}

export default UserBanService;

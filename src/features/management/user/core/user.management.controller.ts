import { delay, inject, injectable } from 'tsyringe';

// Utilities
import sendResponse from 'core/utilities/response';

// Service
import UserService from 'features/shared/user/core/user.service';
import UserBanService from 'features/management/user/ban/ban.service';

// DTO
import {
  UpdateUserDto,
  UserManagementQueryDto,
} from 'features/management/user/core/user.management.dto';

// Mapper
import { UserMapper } from 'features/shared/user/core/user.mapper';

// Types
import type { RequestHandler } from 'express';

@injectable()
export default class UserManagementController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => UserBanService)) private banService: UserBanService,
    @inject(delay(() => UserMapper)) private userMapper: UserMapper
  ) {}

  getOne: RequestHandler = async (req, res) => {
    const user = await this.userService.getOneById(req.params.id, {
      populate: 'avatar',
      lean: true,
    });

    user.isBanned = Boolean(await this.banService.getUserBan(user._id));

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.singular',
      body: {
        data: this.userMapper.toManagementDto(user),
      },
    });
  };

  getAll: RequestHandler = async (req, res) => {
    const query = req.query as unknown as UserManagementQueryDto;
    const filter = await this.userService.buildFilterFromQuery(query, {
      searchBy: [
        { queryKey: 'search', modelKeys: ['username', 'email'], options: 'i' },
      ],
      filterBy: [{ queryKey: 'role', modelKey: 'role', logic: 'and' }],
    });
    const users = await this.userService.find({
      filter,
      populate: 'avatar',
      lean: true,
    });

    await Promise.all(
      users.docs.map(async (user) => {
        user.isBanned = await this.banService.checkIsBanned(user._id);
      })
    );

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.plural',
      body: {
        data: {
          docs: users.docs.map((user) => this.userMapper.toManagementDto(user)),
          pagination: users.pagination,
        },
      },
    });
  };

  getSummaries: RequestHandler = async (req, res) => {
    const users = await this.userService.find({ lean: true, paginate: false });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.plural',
      body: {
        data: users.map((user) => this.userMapper.toManagementSummaryDto(user)),
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateUserDto;
    const user = await this.userService.update(req.params.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.User.singular',
      body: {
        data: this.userMapper.toManagementDto(user),
      },
    });
  };
}

import { delay, inject, injectable } from 'tsyringe';

// Utilities
import sendResponse from 'core/utilites/response';

// Service
import UserService from 'features/shared/user/user.service';

// DTO
import { UpdateUserDto } from 'features/management/user/user.management.dto';

// Mapper
import { UserMapper } from 'features/shared/user/user.mapper';

// Types
import type { RequestHandler } from 'express';

@injectable()
export default class UserManagementController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => UserMapper)) private userMapper: UserMapper
  ) {}

  getOne: RequestHandler = async (req, res) => {
    const user = await this.userService.getOneById(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.singular',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };

  getAll: RequestHandler = async (req, res) => {
    const user = await this.userService.find();

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.plural',
      body: {
        data: {
          docs: user.docs.map((user) => this.userMapper.toDto(user)),
          pagination: user.pagination,
        },
      },
    });
  };

  getSummaries: RequestHandler = async (req, res) => {
    const users = await this.userService.find({ lean: true, paginate: false });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.User.plural',
      body: { data: users },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateUserDto;
    const user = await this.userService.update(req.user.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'PATCH',
      featureName: 'models.User.singular',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };
}

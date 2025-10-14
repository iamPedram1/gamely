import { delay, inject, injectable } from 'tsyringe';

// Utilities
import sendResponse from 'utilites/response';

// DTO
import UserService from 'api/user/user.service';

// Mapper
import { UserMapper } from 'api/user/user.mapper';
import { RequestHandler } from 'express';
import { UpdateProfileDto } from 'api/user/user.dto';

// Types
@injectable()
export default class UserController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => UserMapper)) private userMapper: UserMapper
  ) {}

  getProfile: RequestHandler = async (req, res) => {
    const user = await this.userService.getOneById(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: 'Profile',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };

  refreshToken: RequestHandler = async (req, res) => {
    const newAuth = await this.userService.refreshToken(req.body.refreshToken);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        message: req.t('messages.auth.token_refresh_success'),
        data: newAuth,
      },
    });
  };

  revokeToken: RequestHandler = async (req, res) => {
    await this.userService.clearToken(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        data: null,
        message: req.t('common.operation_completed_successfully'),
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateProfileDto;
    const user = await this.userService.update(req.user.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: 'Profile',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };
}

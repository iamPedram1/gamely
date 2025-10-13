import { delay, inject, injectable } from 'tsyringe';

// Services
import TagService from 'api/tag/tag.service';

// Utilities
import sendResponse, { sendBatchResponse } from 'utilites/response';

// DTO
import UserService from 'api/user/user.service';

// Mapper
import { UserMapper } from 'api/user/user.mapper';
import { RequestHandler } from 'express';
import { UpdateProfileDto } from 'api/user/user.dto';
import { NotFoundError } from 'utilites/errors';

// Types
@injectable()
export default class UserController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => UserMapper)) private userMapper: UserMapper
  ) {}

  getProfile: RequestHandler = async (req, res) => {
    const user = await this.userService.getOneById(req.user?._id);

    if (!user) throw new NotFoundError('User with given id was not found.');

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Profile',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };

  refreshToken: RequestHandler = async (req, res) => {
    console.log(req.body);
    const newAuth = await this.userService.refreshToken(req.body.refreshToken);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        message: 'Token refreshed successfully',
        data: newAuth,
      },
    });
  };

  revokeToken: RequestHandler = async (req, res) => {
    await this.userService.clearToken(req.user._id);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        data: null,
        message: 'Operation completed successfully',
      },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateProfileDto;
    const user = await this.userService.update(req.user?._id, dto);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'Profile',
      body: {
        data: this.userMapper.toDto(user),
      },
    });
  };
}

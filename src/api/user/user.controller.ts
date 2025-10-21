import { delay, inject, injectable } from 'tsyringe';

// Utilities
import sendResponse from 'core/utilites/response';

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

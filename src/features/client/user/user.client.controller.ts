import { delay, inject, injectable } from 'tsyringe';

// Utilities
import sendResponse from 'core/utilities/response';

// DTO
import UserService from 'features/shared/user/user.service';

// Mapper
import { UserMapper } from 'features/shared/user/user.mapper';
import { RequestHandler } from 'express';
import { UpdateProfileDto } from 'features/client/user/user.client.dto';

// Types
@injectable()
export default class UserClientController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => UserMapper)) private userMapper: UserMapper
  ) {}

  getProfile: RequestHandler = async (req, res) => {
    const user = await this.userService.getOneById(req.user.id, {
      populate: 'avatar',
    });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('common.profile'),
      body: { data: this.userMapper.toProfileDto(user) },
    });
  };

  update: RequestHandler = async (req, res) => {
    const dto = req.body as UpdateProfileDto;
    const user = await this.userService.update(req.user.id, dto);

    sendResponse(res, 200, {
      httpMethod: 'GET',
      customName: req.t('common.profile'),
      body: { data: this.userMapper.toProfileDto(user) },
    });
  };
}

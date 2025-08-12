import { LoginDto, RegisterDto } from 'api/auth/auth.dto';
import { IUserService } from 'api/user/user.services';
import { tokenHeaderName } from 'utilites/configs';

import type { RequestHandler } from 'express';

export default class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    const token = await this.userService.register(dto);

    res.header(tokenHeaderName, token).status(204);
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const token = await this.userService.login(dto);

    res.status(200).header(tokenHeaderName, token).send(204);
  };
}

import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'api/user/user.service';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

// Utilities
import sendResponse from 'utilites/response';
import { jwtCookieName } from 'utilites/configs';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {}

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    const token = await this.userService.register(dto);
    res.header(jwtCookieName, token);
    sendResponse(res, 200, {
      body: {
        data: { token },
      },
    });
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const token = await this.userService.login(dto);
    res.header(jwtCookieName, token);
    sendResponse(res, 200, {
      body: {
        data: { token },
      },
    });
  };
}

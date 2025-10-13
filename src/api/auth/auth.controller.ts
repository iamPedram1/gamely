import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'api/user/user.service';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

// Utilities
import sendResponse from 'utilites/response';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {}

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    await this.userService.register(dto);

    sendResponse(res, 200, {
      body: { message: 'Registration completed successfully' },
    });
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const { token, refreshToken } = await this.userService.login(dto);

    sendResponse(res, 200, {
      body: {
        data: { token, refreshToken },
        message: 'Successfully logged in to account',
      },
    });
  };
}

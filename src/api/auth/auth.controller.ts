import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'api/user/user.service';

// DTO
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
} from 'api/auth/auth.dto';

// Utilities
import sendResponse from 'utilites/response';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {}

  recoverPassword: RequestHandler = async (req, res) => {
    const dto = req.body as RecoverPasswordDto;

    await this.userService.recoverPassword(dto);

    sendResponse(res, 200, {
      body: {
        isSuccess: true,
        message: req.t('messages.auth.recover_password'),
      },
    });
  };

  changePassword: RequestHandler = async (req, res) => {
    const dto = req.body as ChangePasswordDto;

    await this.userService.changePassword(dto);

    sendResponse(res, 200, {
      body: {
        isSuccess: true,
        message: req.t('messages.auth.password_changed'),
      },
    });
  };

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    await this.userService.register(dto);

    sendResponse(res, 200, {
      body: { message: req.t('messages.auth.register_success') },
    });
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const { token, refreshToken } = await this.userService.login(dto);

    sendResponse(res, 200, {
      body: {
        data: { token, refreshToken },
        message: req.t('messages.auth.login_success'),
      },
    });
  };
}

import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import AuthService from 'features/shared/auth/auth.service';

// DTO
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
} from 'features/shared/auth/auth.dto';

// Utilities
import sendResponse from 'core/utilities/response';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => AuthService)) private authService: AuthService
  ) {}

  recoverPassword: RequestHandler = async (req, res) => {
    const dto = req.body as RecoverPasswordDto;

    await this.authService.recoverPassword(dto);

    sendResponse(res, 200, {
      body: {
        isSuccess: true,
        message: req.t('messages.auth.recover_password'),
      },
    });
  };

  changePassword: RequestHandler = async (req, res) => {
    const dto = req.body as ChangePasswordDto;

    await this.authService.changePassword(dto);

    sendResponse(res, 200, {
      body: {
        isSuccess: true,
        message: req.t('messages.auth.password_changed'),
      },
    });
  };

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    await this.authService.register(dto);

    sendResponse(res, 200, {
      body: { message: req.t('messages.auth.register_success') },
    });
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const { token, refreshToken } = await this.authService.login(dto);

    sendResponse(res, 200, {
      body: {
        data: { token, refreshToken },
        message: req.t('messages.auth.login_success'),
      },
    });
  };

  refreshToken: RequestHandler = async (req, res) => {
    const newAuth = await this.authService.refreshToken(req.body.refreshToken);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        message: req.t('messages.auth.token_refresh_success'),
        data: newAuth,
      },
    });
  };

  revokeToken: RequestHandler = async (req, res) => {
    await this.authService.clearToken(req.user.id);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        data: null,
        message: req.t('common.operation_completed_successfully'),
      },
    });
  };
}

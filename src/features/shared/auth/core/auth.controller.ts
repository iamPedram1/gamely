import dayjs from 'dayjs';
import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import AuthService from 'features/shared/auth/core/auth.service';

// DTO
import { CreateSessionDto } from 'features/shared/auth/session/session.dto';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
} from 'features/shared/auth/core/auth.dto';

// Utilities
import sendResponse from 'core/utilities/response';
import { jwtRefreshTokenExpiresInDays } from 'features/shared/auth/session/session.constants';

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
    const loginDto = req.body as LoginDto;

    const sessionDto = new CreateSessionDto();
    sessionDto.generatedAt = new Date();
    sessionDto.lastActivity = new Date();
    sessionDto.ip = req.clientIp || '';
    sessionDto.userAgent = req.headers['user-agent'] || '';
    sessionDto.refreshToken = req.body.refreshToken;
    sessionDto.expiresAt = dayjs()
      .add(jwtRefreshTokenExpiresInDays, 'days')
      .toDate();

    const { accessToken, refreshToken } = await this.authService.login(
      loginDto,
      sessionDto
    );

    sendResponse(res, 200, {
      body: {
        data: { accessToken, refreshToken },
        message: req.t('messages.auth.login_success'),
      },
    });
  };
}

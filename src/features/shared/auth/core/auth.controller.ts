import dayjs from 'dayjs';
import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import MailService from 'features/shared/mail/mail.service';
import AuthService from 'features/shared/auth/core/auth.service';

// DTO
import { CreateSessionDto } from 'features/shared/auth/session/session.dto';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
  SendVerificationDto,
  VerifyEmailDto,
} from 'features/shared/auth/core/auth.dto';

// Utilities
import sendResponse from 'core/utilities/response';
import { jwtRefreshTokenExpiresInDays } from 'features/shared/auth/session/session.constant';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => AuthService)) private authService: AuthService,
    @inject(delay(() => MailService)) private mailService: MailService
  ) {}

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    const result = await this.authService.register(dto);
    await this.mailService.sendVerificationEmail(
      result.email,
      result.name,
      result.code
    );

    sendResponse(res, 201, {
      body: {
        message: req.t('messages.auth.register_success'),
        ...(process.env.NODE_ENV === 'test' && {
          data: { code: result ? result.code : '' },
        }),
      },
    });
  };

  login: RequestHandler = async (req, res) => {
    const loginDto = req.body as LoginDto;

    const sessionDto = new CreateSessionDto();
    sessionDto.generatedAt = new Date();
    sessionDto.lastActivity = new Date();
    sessionDto.ip = req.clientIp || '';
    sessionDto.userAgent = req.headers['user-agent'] || 'unknown';
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

  recoverPassword: RequestHandler = async (req, res) => {
    const dto = req.body as RecoverPasswordDto;

    const result = await this.authService.recoverPassword(dto);

    if (result) {
      await this.mailService.sendPasswordRecovery(
        result.email,
        result.name,
        result.key
      );
    }

    sendResponse(res, 200, {
      body: {
        isSuccess: true,
        message: req.t('messages.auth.recover_password'),
        ...(process.env.NODE_ENV === 'test' && {
          data: { recoveryKey: result ? result.key : '' },
        }),
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

  resendVerifyCode: RequestHandler = async (req, res) => {
    const dto = req.body as SendVerificationDto;

    const result = await this.authService.createVerification(dto);
    if (result) {
      await this.mailService.sendVerificationEmail(
        result.email,
        result.name,
        result.code
      );
    }

    sendResponse(res, 200, {
      body: { message: req.t('messages.auth.verification_code_sent') },
    });
  };

  verifyEmail: RequestHandler = async (req, res) => {
    const dto = req.body as VerifyEmailDto;

    await this.authService.verifyEmail(dto);

    sendResponse(res, 200, {
      body: { message: req.t('messages.auth.account_verification_success') },
    });
  };
}

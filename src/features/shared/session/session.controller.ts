import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import SessionService from 'features/shared/session/session.service';

// DTO
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/session/session.dto';

// Utilities
import sendResponse from 'core/utilities/response';

@injectable()
export default class SessionController {
  constructor(
    @inject(delay(() => SessionService)) private sessionService: SessionService
  ) {}

  refreshToken: RequestHandler = async (req, res) => {
    const dto = req.body as RefreshTokenDto;
    const newAuth = await this.sessionService.refreshToken(dto.refreshToken);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        message: req.t('messages.auth.token_refresh_success'),
        data: newAuth,
      },
    });
  };

  revokeToken: RequestHandler = async (req, res) => {
    const dto = req.body as RevokeTokenDto;

    await this.sessionService.revokeToken(dto.refreshToken);

    sendResponse(res, 200, {
      httpMethod: 'POST',
      body: {
        data: null,
        message: req.t('common.operation_completed_successfully'),
      },
    });
  };
}

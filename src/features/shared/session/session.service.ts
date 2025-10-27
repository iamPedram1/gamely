import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Model
import Session from 'features/shared/session/session.model';

// Service
import UserService from 'features/shared/user/user.service';
import tokenUtils from 'core/services/token.service';
import BaseService from 'core/services/base/base.service';

// DTO
import {
  CreateSessionDto,
  UpdateSessionDto,
} from 'features/shared/session/session.dto';

// Utilities
import crypto from 'core/utilities/crypto';
import { t } from 'core/utilities/request-context';
import { AnonymousError, ValidationError } from 'core/utilities/errors';
import {
  jwtRefreshTokenKey,
  jwtRefreshTokenExpiresInDays,
} from 'features/shared/session/session.constants';

// Types
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { ISessionEntity } from 'features/shared/session/session.types';
import type { IRefreshToken } from 'features/shared/session/session.types';

type CreateDto = CreateSessionDto & { _id?: string };

@injectable()
export default class SessionService extends BaseService<
  ISessionEntity,
  CreateDto,
  UpdateSessionDto
> {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {
    super(Session);
  }

  async createSession<TThrowError extends boolean = true>(
    data: CreateDto,
    userId?: string,
    options?:
      | (BaseMutateOptions<boolean> & { throwError?: TThrowError | undefined })
      | undefined
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate Access & Refresh Token
    const { accessToken, refreshToken, sessionId } = this.generateAuthToken(
      data.userId
    );

    // Create a Session
    await super.create(
      { ...data, _id: sessionId, refreshToken },
      userId,
      options
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
    mongooseSession?: mongoose.ClientSession
  ) {
    const { userId, sessionId } = this.verifyRefreshJwt(refreshToken);
    const session = await this.getOneById(sessionId);

    // Validation
    if (session.userId.toHexString() !== userId)
      throw new ValidationError(t('error.refresh_token.invalid'));

    const isRefreshTokenCorrect = await crypto.compare(
      refreshToken,
      session.refreshToken
    );
    if (!isRefreshTokenCorrect)
      throw new ValidationError(t('error.refresh_token.invalid'));

    // Generating Token & Updating Session
    const newAuth = this.generateAuthToken(userId, sessionId);
    session.set('refreshToken', newAuth.refreshToken);
    session.set('refreshedAt', new Date());
    session.set('lastActivity', new Date());
    session.set(
      'expiresAt',
      dayjs().add(jwtRefreshTokenExpiresInDays, 'days').toDate()
    );

    const res = await session.save({ session: mongooseSession });

    if (!res)
      throw new AnonymousError('An error occured while updating session');

    return {
      accessToken: newAuth.accessToken,
      refreshToken: newAuth.refreshToken,
    };
  }

  async revokeToken(refreshToken: string) {
    const { sessionId } = this.verifyRefreshJwt(refreshToken);

    await this.deleteOneById(sessionId, { lean: true });
  }

  private generateAuthToken(userId: string, sessionId?: string) {
    const session = sessionId || new mongoose.Types.ObjectId().toHexString();
    const accessToken = this.generateAccessToken(userId, session);
    const refreshToken = this.generateRefreshToken(userId, session);
    return { accessToken, refreshToken, sessionId: session };
  }

  private generateAccessToken(userId: string, sessionId: string) {
    return tokenUtils.generateAccessToken(userId, sessionId);
  }

  private generateRefreshToken(userId: string, sessionId: string) {
    return tokenUtils.generateRefreshToken(userId, sessionId);
  }

  private verifyRefreshJwt(refreshToken: string) {
    return tokenUtils.verify<IRefreshToken>(
      refreshToken,
      jwtRefreshTokenKey,
      t('common.refreshToken')
    );
  }
}

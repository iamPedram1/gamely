import jwt from 'jsonwebtoken';
import { delay, inject, injectable } from 'tsyringe';

// Service
import tokenUtils from 'core/services/token.service';
import UserService from 'features/shared/user/user.service';
import SessionService from 'features/shared/session/session.service';

// DTO
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'features/shared/auth/auth.dto';

// Utilities
import logger from 'core/utilities/logger';
import crypto from 'core/utilities/crypto';
import { sendEmail } from 'core/utilities/mail';
import { i18nInstance, t } from 'core/utilities/request-context';
import {
  recoveryEnglishHtml,
  recoveryPersianHtml,
} from 'features/shared/auth/auth.html';
import {
  AnonymousError,
  ValidationError,
  InternalServerError,
  ForbiddenError,
} from 'core/utilities/errors';
import {
  jwtRecoverPasswordKey,
  jwtRecoverPasswordKeyExpiresInMinutes,
} from 'features/shared/auth/auth.constants';

// Types
import { CreateSessionDto } from 'features/shared/session/session.dto';
import { IRecoveryKey, IUserEntity } from 'features/shared/user/user.types';
import type { BaseMutateOptions } from 'core/types/base.service.type';

@injectable()
export default class AuthService {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => SessionService)) private sessionService: SessionService
  ) {}

  async register(
    data: RegisterDto,
    options?: BaseMutateOptions
  ): Promise<IUserEntity> {
    const user = await this.userService.existsByKey('email', data.email);

    if (user) throw new ValidationError(t('messages.auth.email_exists'));

    return await this.userService.create({ ...data }, options);
  }

  async recoverPassword(
    data: RecoverPasswordDto,
    options?: BaseMutateOptions
  ): Promise<void> {
    const email = data.email.toLowerCase();
    const user = await this.userService.getOneByKey('email', email, {
      select: '+recoveryKey',
      throwError: false,
    });
    if (!user) return;

    if (user.recoveryKey) {
      try {
        this.verifyRecoveryJwt(user.recoveryKey);
        await this.sendRecoveryEmail(user, user.recoveryKey);
      } catch (error) {
        logger.error('User Recovery is invalid or expired', {
          message: error.message,
          user: user._id,
        });
      }
    }

    await this.userService.mutateWithTransaction(async (session) => {
      const key = this.generatePasswordRecoveryKey(user._id.toHexString());
      await user.set('recoveryKey', key).save({ session, ...options });
      const result = await this.sendRecoveryEmail(user, key);
      if (!result.success) throw new InternalServerError();
    }, options?.session);
  }

  async changePassword(
    data: ChangePasswordDto,
    options?: BaseMutateOptions
  ): Promise<void> {
    const key = this.verifyRecoveryJwt(data.recoveryKey);
    const user = await this.userService.getOneById(key.userId, {
      select: '+recoveryKey',
    });
    const userId = user._id.toHexString();

    const isRecoveryKeyCorrect = user.recoveryKey
      ? await crypto.compare(data.recoveryKey, user.recoveryKey)
      : false;

    if (!isRecoveryKeyCorrect)
      throw new ValidationError(t('error.recovery_token.invalid'));

    return await this.userService.mutateWithTransaction(async (session) => {
      user.recoveryKey = null;
      user.password = data.password;
      await Promise.all([
        user.save({ session }),
        this.sessionService.deleteManyByKey('userId', userId, {
          session,
          lean: true,
        }),
      ]);
    }, options?.session);
  }

  async login(data: LoginDto, sessionData: CreateSessionDto) {
    const mask = t('error.invalid_credentials');

    const user = await this.userService.getOneByKey(
      'email',
      data.email.toLowerCase(),
      { select: '+password', throwError: false }
    );

    // Existance Check
    if (!user) throw new AnonymousError('User not found', mask);

    // Password Check
    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect)
      throw new AnonymousError('Password is not correct', mask);

    // Status Check
    if (user.isBlocked()) throw new ForbiddenError(t('error.user.is_blocked'));

    // Generate Token
    const session = await this.sessionService.createSession({
      ...sessionData,
      userId: user._id.toHexString(),
    });

    if (!session)
      throw new AnonymousError('Error occured while creating session');

    return session;
  }

  private verifyRecoveryJwt(recoveryKey: string) {
    return tokenUtils.verify<IRecoveryKey>(
      recoveryKey,
      jwtRecoverPasswordKey,
      t('common.recoveryKey')
    );
  }

  private generatePasswordRecoveryKey(userId: string) {
    return jwt.sign({ userId }, jwtRecoverPasswordKey, {
      expiresIn: `${jwtRecoverPasswordKeyExpiresInMinutes}m`,
    });
  }

  private async sendRecoveryEmail(user: IUserEntity, key: string) {
    return await sendEmail({
      to: user.email,
      subject: t('messages.auth.password_recovery_emailSubject'),
      html:
        i18nInstance().resolvedLanguage === 'fa'
          ? recoveryPersianHtml(user.username, key)
          : recoveryEnglishHtml(user.username, key),
    });
  }
}

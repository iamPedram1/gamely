import jwt from 'jsonwebtoken';
import { delay, inject, injectable } from 'tsyringe';

// Model
import { IRecoveryKey, IRefreshToken } from 'features/shared/user/user.model';

// Service
import UserService from 'features/shared/user/user.service';
import tokenUtils from 'core/services/token.service';

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
  jwtRefreshTokenKey,
} from 'features/shared/auth/auth.constants';

// Types
import { IUserEntity } from 'features/shared/user/user.types';

@injectable()
export default class AuthService {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {}

  async register(data: RegisterDto): Promise<IUserEntity> {
    const user = await this.userService.existsByKey('email', data.email);

    if (user) throw new ValidationError(t('messages.auth.email_exists'));

    return await this.userService.create({ ...data });
  }

  async recoverPassword(data: RecoverPasswordDto): Promise<void> {
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
      await user.set('recoveryKey', key).save({ session });
      const result = await this.sendRecoveryEmail(user, key);
      if (!result.success) throw new InternalServerError();
    });
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    const key = this.verifyRecoveryJwt(data.recoveryKey);
    const user = await this.userService.getOneById(key.userId, {
      select: '+recoveryKey',
    });

    const isRecoveryKeyCorrect = user.recoveryKey
      ? await crypto.compare(data.recoveryKey, user.recoveryKey)
      : false;

    if (!isRecoveryKeyCorrect)
      throw new ValidationError(t('error.recovery_token.invalid'));

    return await this.userService.mutateWithTransaction(async (session) => {
      user.password = data.password;
      user.recoveryKey = null;
      if (user.refreshToken) user.refreshToken = null;
      await user.save({ session });
    });
  }

  async login(data: LoginDto) {
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
    const { token, refreshToken } = user.generateAuthToken();
    const res = await user.set('refreshToken', refreshToken).save();

    if (!res) throw new AnonymousError('Error occured while saving tokens');

    return { token, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const { userId } = this.verifyRefreshJwt(refreshToken);
    const user = await this.userService.getOneById(userId, {
      select: '+refreshToken',
    });

    if (!(await user.compareRefreshToken(refreshToken)))
      throw new ValidationError(t('error.refresh_token.invalid'));

    const newAuth = user.generateAuthToken();

    const res = await user.set('refreshToken', newAuth.refreshToken).save();

    if (!res)
      throw new AnonymousError('An error occured while generating token');

    return newAuth;
  }

  async clearToken(userId: string) {
    const user = await this.userService.getOneById(userId);

    if (user.refreshToken) {
      const res = await user.set('refreshToken', null).save();

      if (!res)
        throw new AnonymousError('An error occured while cleaning up token');
    }
  }

  private verifyRecoveryJwt(recoveryKey: string) {
    return tokenUtils.verify<IRecoveryKey>(
      recoveryKey,
      jwtRecoverPasswordKey,
      t('common.recoveryKey')
    );
  }

  private verifyRefreshJwt(refreshToken: string) {
    return tokenUtils.verify<IRefreshToken>(
      refreshToken,
      jwtRefreshTokenKey,
      t('common.refreshToken')
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
          ? recoveryPersianHtml(user.name, key)
          : recoveryEnglishHtml(user.name, key),
    });
  }
}

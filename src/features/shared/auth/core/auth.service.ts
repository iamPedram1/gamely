import dayjs from 'dayjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { delay, inject, injectable } from 'tsyringe';

// Service
import tokenUtils from 'core/services/token.service';
import UserService from 'features/shared/user/core/user.service';
import BanService from 'features/management/user/ban/ban.service';
import SessionService from 'features/shared/auth/session/session.service';

// DTO
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
  SendVerificationDto,
  VerifyEmailDto,
} from 'features/shared/auth/core/auth.dto';

// Utilities
import cryptoUtils from 'core/utilities/crypto';
import { t } from 'core/utilities/request-context';
import { sleep } from 'core/utilities/helperPack';
import { withTransaction } from 'core/utilities/mongoose';
import {
  jwtRecoverPasswordKey,
  jwtRecoverPasswordKeyExpiresInMinutes,
} from 'features/shared/auth/core/auth.constant';
import {
  ForbiddenError,
  AnonymousError,
  ValidationError,
  BadRequestError,
} from 'core/utilities/errors';

// Types
import type { CreateSessionDto } from 'features/shared/auth/session/session.dto';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type {
  IRecoveryKey,
  IVerification,
  UserDocument,
} from 'features/shared/user/core/user.types';

@injectable()
export default class AuthService {
  constructor(
    @inject(delay(() => BanService)) private banService: BanService,
    @inject(delay(() => UserService)) private userService: UserService,
    @inject(delay(() => SessionService)) private sessionService: SessionService
  ) {}

  async register(data: RegisterDto, options?: BaseMutateOptions) {
    let user = await this.userService.getOneByKey('email', data.email, {
      throwError: false,
    });

    const [isEmailTaken, isUsernameTaken] = await Promise.all([
      this.userService.existsByCondition({
        email: data.email,
        ...(user?._id && { _id: { $ne: user._id } }),
      }),
      this.userService.existsByCondition({
        username: data.username,
        ...(user?._id && { _id: { $ne: user._id } }),
      }),
    ]);

    // Uniqueness Check
    if (isEmailTaken) {
      throw new ValidationError(t('messages.auth.email_exists'));
    }
    if (isUsernameTaken) {
      throw new ValidationError(
        t('error.uniqueness_error', {
          field: 'username',
          value: data.username,
          name: t(`models.User.singular`),
        })
      );
    }
    // Verification check
    if (user?.status === 'verified') {
      throw new ValidationError(t('messages.auth.email_exists'));
    }

    const { verification, code } = await this.generateOtp();

    // Continue Register & Verification
    if (user) {
      const keys = ['name', 'username', 'email', 'password'] as const;

      keys.forEach((key) => user!.set(key, data[key]));
      user.set('verification', verification);

      user = await user.save();
    } else {
      // Create New Account
      user = await this.userService.create(
        {
          ...data,
          verification,
        },
        options
      );
    }

    return { email: user!.email, name: user!.name, code };
  }

  async recoverPassword(data: RecoverPasswordDto, options?: BaseMutateOptions) {
    const email = data.email.trim().toLowerCase();
    const user = await this.userService.getOneByKey('email', email, {
      select: '+recoveryKey',
      throwError: false,
    });

    if (!user) return await this.securityDelay();

    const key = this.generatePasswordRecoveryKey(user._id.toHexString());

    await user.set('recoveryKey', key).save(options);

    return { email: user.email, name: user.name, key };
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

    return await withTransaction(async (session) => {
      user.recoveryKey = null;
      user.password = data.password;
      await Promise.all([
        user.save({ session }),
        this.sessionService.deleteManyByKey('user', userId, {
          session,
          lean: true,
        }),
      ]);
    }, options?.session);
  }

  async createVerification(data: SendVerificationDto) {
    const user = await this.userService.getOneByCondition(
      { email: data.email, status: 'unverified' },
      { throwError: false, select: 'verification' }
    );

    if (!user) return;

    const { verification, code } = await this.generateOtp();

    await user.set('verification', verification).save();

    return { email: user.email, name: user.name, code };
  }

  async verifyEmail(data: VerifyEmailDto, options?: BaseMutateOptions) {
    const email = data.email.trim().toLowerCase();
    const user = await this.userService.getOneByKey('email', email, {
      select: 'verification',
    });

    if (user.status === 'verified')
      throw new BadRequestError(t('messages.auth.already_verified'));

    if (!user.verification)
      throw new BadRequestError(t('messages.auth.no_active_code'));

    const isCodeCorrect = await cryptoUtils.compare(
      data.code,
      user.verification.hashedCode
    );

    if (!isCodeCorrect)
      throw new ValidationError(t('messages.auth.invalid_code'));

    if (dayjs().isAfter(user.verification.expireAt))
      throw new BadRequestError(t('messages.auth.expired_code'));

    await user.updateOne({ verification: null, status: 'verified' }, options); // Includes Transaction if used somewhere else
  }

  async login(data: LoginDto, sessionData: CreateSessionDto) {
    const mask = t('error.invalid_credentials');

    const user = (await this.userService.getOneByKey(
      'email',
      data.email.toLowerCase(),
      { select: '+password', throwError: false }
    )) as UserDocument;

    // Existance Check
    if (!user) {
      await this.securityDelay();
      throw new AnonymousError('User not found', mask, 400);
    }

    // Password Check
    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect) {
      await this.securityDelay();
      throw new AnonymousError('Password is not correct', mask, 400);
    }

    // Verification Check
    if (user.status === 'unverified')
      throw new ForbiddenError(t('messages.auth.not_verified'));

    // Status Check
    if (await this.banService.checkIsBanned(user._id))
      throw new ForbiddenError(t('error.user.is_blocked'));

    // Generate Token
    const session = await this.sessionService.createSession({
      ...sessionData,
      user: user._id.toHexString(),
    });

    if (!session)
      throw new AnonymousError('Error occured while creating session');

    return session;
  }

  private async securityDelay() {
    return await sleep(600 + Math.random() * 200);
  }

  private async generateOtp() {
    const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    return {
      code,
      verification: {
        hashedCode: await cryptoUtils.hash(code),
        expireAt: dayjs().add(10, 'minute').toDate(),
      } as IVerification,
    };
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
}

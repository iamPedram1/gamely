import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { injectable } from 'tsyringe';

// Model
import User, { IRefreshToken } from 'api/user/user.model';

// Service
import BaseService from 'services/base.service.module';

// Utilities
import {
  AnonymousError,
  ValidationError,
  InternalServerError,
} from 'utilites/errors';

// Dto
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'api/auth/auth.dto';

// Utilities
import { sendEmail } from 'utilites/mail';

// Types
import { UserDocument } from 'api/user/user.model';
import { UpdateProfileDto } from 'api/user/user.dto';
import { IUserEntity } from 'api/user/user.types';
import {
  jwtRecoverPasswordKey,
  jwtRecoverPasswordKeyExpiresInMinutes,
  jwtRefreshTokenKey,
  userAppUrl,
} from 'utilites/configs';

type AuthTokens = Pick<IUserEntity, 'refreshToken' | 'token'>;
type RecoveryKey = { userId: string };

export type IUserService = InstanceType<typeof UserService>;

@injectable()
export default class UserService extends BaseService<
  IUserEntity,
  RegisterDto & Partial<AuthTokens>,
  UpdateProfileDto & Partial<AuthTokens>,
  UserDocument
> {
  constructor() {
    super(User);
  }

  async register(data: RegisterDto): Promise<IUserEntity> {
    const user = await this.existsByKey('email', data.email);

    if (user) throw new ValidationError(this.t('messages.auth.email_exists'));

    data.password = await this.hashPassword(data.password);

    return await this.create({ ...data });
  }

  private generatePasswordRecoveryKey(userId: string) {
    return jwt.sign({ userId }, jwtRecoverPasswordKey, {
      expiresIn: `${jwtRecoverPasswordKeyExpiresInMinutes}m`,
    });
  }

  private async sendRecoveryPasswordEmail(
    name: string,
    email: string,
    key: string
  ) {
    const recoveryUrl = `${userAppUrl}/recovery/${key}`;
    const en = `
  <html>
    <body style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p>You requested to reset your password for your Gamely account.</p>
        <p>Please click the button below to set a new password. This link is valid for a limited time.</p>
        <p style="text-align:center; margin: 30px 0;">
          <a href="${recoveryUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p>If you didn't request this change, you can safely ignore this email.</p>
        <p>Thanks,<br/>The Gamely Team</p>
      </div>
    </body>
  </html>
  `;

    const fa = `
  <html dir="rtl">
    <body style="font-family: Tahoma, sans-serif; background-color:#f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); text-align: right;">
        <h2 style="direction: rtl; color: #333;">سلام ${name} عزیز،</h2>
        <p  style="direction: rtl;">شما درخواست تغییر رمز عبور برای حساب Gamely خود را داده‌اید.</p>
        <p  style="direction: rtl;">لطفاً برای تعیین رمز عبور جدید، روی دکمه زیر کلیک کنید. این لینک تنها به مدت 10 دقیقه معتبر است.</p>
        <p style="text-align:center; margin: 30px 0;">
          <a href="${recoveryUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">تغییر رمز عبور</a>
        </p>
        <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
        <p style="direction: rtl;">با تشکر،<br/>تیم Gamely</p>
      </div>
    </body>
  </html>
  `;

    return await sendEmail({
      to: email,
      subject: 'Gamely - Password Recovery',
      html: this.i18n().resolvedLanguage === 'fa' ? fa : en,
    });
  }

  async recoverPassword(data: RecoverPasswordDto): Promise<boolean> {
    const email = data.email.toLowerCase();
    const user = await this.getOneByKey('email', email, {
      select: '+recoveryKey',
      throwError: false,
    });
    if (!user) return false;

    if (user.recoveryKey) {
      try {
        jwt.verify(user.recoveryKey, jwtRecoverPasswordKey);
        this.sendRecoveryPasswordEmail(
          user.name,
          user.email,
          jwtRecoverPasswordKey
        );
        return true;
      } catch (error) {}
    }

    return await this.withTransaction(async (session) => {
      const key = this.generatePasswordRecoveryKey(user._id.toHexString());
      await user.set('recoveryKey', key).save({ session });
      const result = await this.sendRecoveryPasswordEmail(
        user.name,
        user.email,
        key
      );
      if (!result.success) throw new InternalServerError();
      return true;
    });
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    try {
      const key = jwt.verify(
        data.recoveryKey,
        jwtRecoverPasswordKey
      ) as RecoveryKey;

      const user = await this.getOneById(key.userId, {
        select: '+recoveryKey',
      });

      if (
        user.recoveryKey !== data.recoveryKey ||
        user.email !== data.email.trim().toLowerCase()
      )
        throw new Error();

      return await this.withTransaction(async (session) => {
        user.password = await this.hashPassword(data.password);
        user.token = null;
        user.recoveryKey = null;
        user.refreshToken = null;
        await user.save({ session });
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new ValidationError(this.t('error.recovery_token_expired'));
      if (error instanceof jwt.JsonWebTokenError)
        throw new ValidationError(this.t('error.recovery_token_invalid'));
      throw new ValidationError(
        this.t('messages.auth.email_or_recoveryKey_invalid')
      );
    }
  }

  async update(userId: string, data: UpdateProfileDto): Promise<IUserEntity> {
    const user = await this.updateOneById(
      userId,
      {
        ...data,
        ...(data.password && {
          password: await this.hashPassword(data.password),
        }),
      },
      { lean: true }
    );

    return user;
  }

  async login(data: LoginDto) {
    const user = await this.getOneByKey('email', data.email.toLowerCase(), {
      select: '+password',
      throwError: false,
    });

    const mask = this.t('error.invalid_credentials');

    if (!user) throw new AnonymousError('User not found', mask);

    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect)
      throw new AnonymousError('Password is not correct', mask);

    const { token, refreshToken } = user.generateAuthToken();

    user.set('token', token);
    user.set('refreshToken', refreshToken);

    const res = await user.save();
    if (!res)
      throw new AnonymousError('Error occured while saving tokens', mask);

    return { token, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const { userId } = jwt.verify(
      refreshToken,
      jwtRefreshTokenKey
    ) as IRefreshToken;
    const user = await this.getOneById(userId, { select: '+refreshToken' });

    if (user.refreshToken !== refreshToken)
      throw new ValidationError(this.t('error.refresh_token_invalid'));

    const newAuth = user.generateAuthToken();

    user.set('token', newAuth.token);
    user.set('refreshToken', newAuth.refreshToken);

    const res = await user.save();

    if (!res)
      throw new AnonymousError('An error occured while generating token');

    return newAuth;
  }

  async clearToken(userId: string) {
    const user = await this.getOneById(userId);
    user.set('token', null);
    user.set('refreshToken', null);

    const res = await user.save();

    if (!res)
      throw new AnonymousError('An error occured while cleaning up token');

    return true;
  }

  private async comparePassword(password: string, hash: string) {
    return await bcryptjs.compare(password, hash);
  }

  private async hashPassword(password: string) {
    const salt = await bcryptjs.genSalt();
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  }
}

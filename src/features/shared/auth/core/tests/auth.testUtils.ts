import { faker } from '@faker-js/faker';

// Models
import User from 'features/shared/user/core/user.model';

// Utilities
import tokenUtils from 'core/services/token.service';
import { prefixBaseUrl } from 'core/utilities/configs';
import { expectBadRequest } from 'core/utilities/testHelpers';
import { normalizeUsername } from 'core/utilities/helperPack';
import { sendPostRequest, SendRequestOptions } from 'core/utilities/supertest';
import {
  ChangePasswordDto,
  LoginDto,
  LoginResponseDto,
  RecoverPasswordDto,
  RegisterDto,
  RegisterResponseDto,
  VerifyEmailDto,
} from 'features/shared/auth/core/auth.dto';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';
import type { IAccessToken } from 'features/shared/auth/session/session.types';

const registerURL = prefixBaseUrl('/auth/register');
const verifyEmailURL = prefixBaseUrl('/auth/register/verify-email');
const loginURL = prefixBaseUrl('/auth/login');
const recoverPasswordURL = prefixBaseUrl('/auth/recover-password');
const changePasswordURL = prefixBaseUrl('/auth/change-password');

export function generateUser() {
  return {
    name: faker.person.fullName(),
    username: normalizeUsername(faker.internet.username()),
    password: faker.internet.password(),
    email: faker.internet.email(),
    bio: faker.person.bio(),
  };
}

export function generateAccessToken() {
  const user = new User(generateUser());

  return tokenUtils.generateAccessToken(user._id.toHexString(), 'sessionId');
}

export async function createUser(user: RegisterDto = generateUser()) {
  return await new User({ ...user, status: 'verified' }).save();
}

export async function registerAndLogin(
  options?: SendRequestOptions<RegisterDto> & { role?: UserRole }
): Promise<RegisterResponseDto & { userId: string; sessionId: string }> {
  const payload = options?.payload ?? generateUser();

  const register = await sendRegisterRequest({
    payload,
    ...options,
  });

  if (options?.role)
    await User.findOneAndUpdate(
      { email: payload.email },
      { role: options.role }
    );

  const res = await sendLoginRequest({ payload });
  let userId = '';
  let sessionId = '';

  if (res.body.data?.accessToken) {
    const decoded = tokenUtils.decode<IAccessToken>(
      res.body.data?.accessToken!
    );
    userId = decoded.userId;
    sessionId = decoded.sessionId;
  }

  return { ...res.body.data, userId, sessionId } as RegisterResponseDto & {
    userId: string;
    sessionId: string;
  };
}

export async function registerAndLoginBatch(
  count: number,
  options?: SendRequestOptions<RegisterDto> & { role?: UserRole }
): Promise<Array<RegisterResponseDto & { userId: string; sessionId: string }>> {
  return await Promise.all(
    Array(count)
      .fill(0)
      .map(() => registerAndLogin(options))
  );
}

export const sendRegisterRequest = async (
  options?: SendRequestOptions<RegisterDto>
) => {
  const payload = options?.payload ?? generateUser();

  const res = await sendPostRequest<RegisterResponseDto>(registerURL, {
    ...options,
    payload,
  });

  if (res.body.isSuccess) {
    await sendVerifyEmailRequest({
      payload: { email: payload.email, code: (res.body.data as any).code },
    });
  }

  return res;
};

export const sendVerifyEmailRequest = async (
  options: SendRequestOptions<VerifyEmailDto>
) => await sendPostRequest<null>(verifyEmailURL, options);

export const sendLoginRequest = async (
  options?: SendRequestOptions<LoginDto>
) =>
  await sendPostRequest<LoginResponseDto>(loginURL, {
    payload: generateUser(),
    ...options,
  });

export const sendRecoverPasswordRequest = async (
  options?: SendRequestOptions<RecoverPasswordDto>
) =>
  await sendPostRequest<{ recoveryKey: string }>(recoverPasswordURL, {
    payload: generateUser(),
    ...options,
  });

export const sendChangePasswordRequest = async (
  options?: SendRequestOptions<ChangePasswordDto>
) =>
  await sendPostRequest(changePasswordURL, {
    payload: generateUser(),
    ...options,
  });

export const expectRejectsWhenAuthenticated = async (
  exec: (token: string) => Promise<any>
) => {
  const token = generateAccessToken();
  return expectBadRequest(await exec(token));
};

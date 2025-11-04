import { faker, fakerFA } from '@faker-js/faker';
import tokenUtils from 'core/services/token.service';
import User from 'features/shared/user/core/user.model';
import {
  ChangePasswordDto,
  LoginDto,
  LoginResponseDto,
  RecoverPasswordDto,
  RegisterDto,
  RegisterResponseDto,
} from 'features/shared/auth/core/auth.dto';
import supertest, {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

import { Model } from 'mongoose';
import { Response } from 'supertest';
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilities/configs';
import {
  CategoryManagementResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'features/management/category/category.management.dto';
import Category from 'features/shared/category/category.model';
import { UserRole } from 'features/shared/user/core/user.types';

export function generateUser() {
  return {
    username: faker.internet
      .username()
      .replace(/\.\./g, '.')
      .replace(/__+/g, '_')
      .replace(/-/g, '_') // Replace hyphens with underscores
      .toLowerCase()
      .slice(0, 30)
      .padEnd(3, 'a'),
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
  return await new User(user).save();
}

export async function registerAndLogin(
  options?: SendRequestOptions<RegisterDto> & { role?: UserRole }
) {
  const payload = options?.payload ?? generateUser();

  await sendRegisterRequest({
    payload,
    ...options,
  });

  if (options?.role)
    await User.findOneAndUpdate(
      { email: payload.email },
      { role: options.role }
    );

  const res = await sendLoginRequest({ payload });

  return res?.body?.data || null;
}

export const cleanUpDatabase = async (...args: Model<any>[]) => {
  await Promise.all(args.map((model) => model.deleteMany()));
};

export const makeExec =
  (fn: Function) => async (payload: any, token?: string) =>
    fn(payload, token);

export const expectBadRequest = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(400);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectUnauthorizedError = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(401);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectRejectsWhenAuthenticated = async (
  exec: (token: string) => Promise<any>
) => {
  const token = generateAccessToken();
  return expectBadRequest(await exec(token));
};

const registerURL = prefixBaseUrl('/auth/register');
const loginURL = prefixBaseUrl('/auth/login');
const recoverPasswordURL = prefixBaseUrl('/auth/recover-password');
const changePasswordURL = prefixBaseUrl('/auth/change-password');

// <----------------   AUTH   ---------------->
export function generateCategory() {
  return {
    parentId: null,
    slug: faker.lorem.slug({ min: 2, max: 3 }),
    translations: {
      en: { title: faker.internet.displayName() },
      fa: { title: fakerFA.internet.displayName() },
    },
  } as CreateCategoryDto;
}

export const sendRegisterRequest = async (
  options?: SendRequestOptions<RegisterDto>
) =>
  await sendPostRequest<RegisterResponseDto>(registerURL, {
    payload: generateUser(),
    ...options,
  });

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

// <----------------   CATEGORY   ---------------->
const categoriesURL = prefixManagementBaseUrl('/categories');

export const sendCreateCategoryRequest = async (
  options?: SendRequestOptions<CreateCategoryDto>
) => {
  return await sendPostRequest<CategoryManagementResponseDto>(categoriesURL, {
    payload: generateCategory(),
    ...options,
  });
};
export const sendPatchCategoryRequest = async (
  id: string,
  options: SendRequestOptions<UpdateCategoryDto>
) => {
  return await sendPatchRequest<
    CategoryManagementResponseDto,
    UpdateCategoryDto
  >(`${categoriesURL}/${id}`, options);
};

export const sendGetCategoryRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(categoriesURL, { token });
};

export const sendDeleteCategoryRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${categoriesURL}/${id}`, { token });
};

export async function createCategory(
  category: CreateCategoryDto = generateCategory()
) {
  return await new Category(category).save();
}

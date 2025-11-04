import { faker } from '@faker-js/faker';
import tokenUtils from 'core/services/token.service';
import User from 'features/shared/user/core/user.model';
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'features/shared/auth/core/auth.dto';
import supertest from 'core/utilities/supertest';

import { Collection, Document, Model } from 'mongoose';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';
import { Response } from 'supertest';
import { prefixBaseUrl } from 'core/utilities/configs';

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

export const sendPostRequest = async (
  endpoint: string,
  payload: any,
  token?: string
) => {
  return await supertest()
    .post(endpoint)
    .set(jwtAccessTokenName, token || '')
    .send(payload);
};

export const sendPatchRequest = async (
  endpoint: string,
  payload: any,
  token?: string
) => {
  return await supertest()
    .patch(endpoint)
    .set(jwtAccessTokenName, token || '')
    .send(payload);
};
export const sendGetRequest = async (endpoint: string) => {
  return await supertest().get(endpoint);
};

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
export const sendRegisterRequest = async (
  payload: LoginDto = generateUser(),
  token?: string
): Promise<Response> => await sendPostRequest(registerURL, payload, token);
export const sendLoginRequest = async (
  payload: LoginDto = generateUser(),
  token?: string
): Promise<Response> => await sendPostRequest(loginURL, payload, token);
export const sendRecoverPasswordRequest = async (
  payload: RecoverPasswordDto,
  token?: string
): Promise<Response> =>
  await sendPostRequest(recoverPasswordURL, payload, token);
export const sendChangePasswordRequest = async (
  payload: ChangePasswordDto,
  token?: string
): Promise<Response> =>
  await sendPostRequest(changePasswordURL, payload, token);

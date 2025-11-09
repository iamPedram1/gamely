import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';

// Types
import type { Model } from 'mongoose';
import type { Response } from 'supertest';
import type { SuperTestResponse } from 'core/utilities/supertest';
import type { IApiResponse } from 'core/utilities/response';
import { ModelKeys } from 'core/types/common';
import { UserRole } from 'features/shared/user/core/user.types';

export const expectBadRequest = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(400);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectUnauthorizedError = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(401);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectForbiddenRequest = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(403);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectNotFoundError = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(404);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectSuccess = (
  response: SuperTestResponse<IApiResponse<any>>,
  status = 200,
  regex?: RegExp
) => {
  expect(response.status).toBe(status);

  if (status !== 204) {
    expect(response.body.statusCode).toBe(status);
    expect(response.body.isSuccess).toBe(true);
  }

  if (regex && status !== 204) expect(response.body.message).toMatch(regex);
};

export const expectKeysExist = (obj: object, keys: string[]) => {
  keys.forEach((key) => expect(obj).toHaveProperty(key));
};

export const clearDbAfterEach = (...models: Model<any, any, any>[]) => {
  return afterEach(async () => {
    await Promise.all(models.map((model) => model.deleteMany()));
  });
};

export const describe200 = (fn: () => void) => {
  describe('should return 200', () => {
    fn();
  });
};

export const describe201 = (fn: () => void) => {
  describe('should return 201', () => {
    fn();
  });
};

export const describe204 = (fn: () => void) => {
  describe('should return 204', () => {
    fn();
  });
};

export const describe400 = (fn: () => void) => {
  describe('should return 400', () => {
    fn();
  });
};

export const describe401 = (fn: () => void) => {
  describe('should return 401', () => {
    fn();
  });
};

export const describe403 = (fn: () => void) => {
  describe('should return 403', () => {
    fn();
  });
};

export const describe404 = (fn: () => void) => {
  describe('should return 404', () => {
    fn();
  });
};

export const itShouldReturnsPaginatedDocs = (exec: () => any) => {
  it('and return paginated docs', async () => {
    const res = await exec();
    const { data } = res.body;

    expect(data?.pagination).toBeDefined();
    expect(Array.isArray(data?.docs)).toBe(true);
  });
};

export const itShouldRequireToken = (
  exec: (overwriteToken?: string) => any
) => {
  it('if user does not have token in header', async () => {
    const response = await exec('');

    expectUnauthorizedError(response);
  });
};

export const itShouldRequireManagementRole = (
  exec: (overwriteToken?: string) => any
) => {
  it('if role is not [author,admin,superAdmin]', async () => {
    const token = (await registerAndLogin())?.accessToken || '';

    const response = await exec(token);

    expect(response.status).toBe(403);
  });
};

export function itShouldOwn(
  role: UserRole,
  exec: (overwriteToken?: string) => Promise<any>,
  modelName: Lowercase<ModelKeys>,
  expectStatus = 403,
  regex: RegExp = /you didn't/i
) {
  it(`should return ${expectStatus} if role is ${role} but you don't own the ${modelName}`, async () => {
    const token = (await registerAndLogin({ role }))?.accessToken || '';

    const response = await exec(token);

    expect(response.status).toBe(expectStatus);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.message).toMatch(regex);
  });
}

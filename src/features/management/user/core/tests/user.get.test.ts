import { faker } from '@faker-js/faker';

// Utils
import tokenUtils from 'core/services/token.service';
import { UserRole } from 'features/shared/user/core/user.types';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateUserService } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendGetUserRequest } from 'features/management/user/core/tests/user.testUtils';
import {
  expectKeysExist,
  expectNotFoundError,
  expectSuccessGET,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// Dto
import { UserManagementResponseDto } from 'features/management/user/core/user.management.dto';

// Types
import type { IAccessToken } from 'features/shared/auth/session/session.types';
import type { WithPagination } from 'core/types/paginate';

describe('GET /management/users', () => {
  let token: string;
  const userService = generateUserService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
  });

  afterEach(async () => {
    await userService.deleteManyWithConditions({});
  });

  const exec = async () =>
    sendGetUserRequest<WithPagination<UserManagementResponseDto>>(token);

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  describe('should return 403 if', () => {
    for (let role of ['user', 'author'] as UserRole[]) {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(403);
      });
    }
  });

  describe('should return 200 if', async () => {
    for (let role of adminRoles) {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    }
  });

  it('should return paginated user docs if authorized', async () => {
    const res = await exec();
    const { data } = res.body;

    expect(data?.pagination?.totalDocs).toBeGreaterThan(0);
    expect(Array.isArray(data?.docs)).toBe(true);
    expect(data?.docs.length).toBeGreaterThan(0);
  });

  it('should return user object in success response', async () => {
    const res = await exec();

    const keys: Array<keyof UserManagementResponseDto> = [
      'username',
      'email',
      'role',
      'avatar',
    ];

    expect(Object.keys(res.body.data!.docs[0]!)).toEqual(
      expect.arrayContaining(keys)
    );
  });
});

describe('GET /management/users/:id', () => {
  let token: string;
  let userId: string;
  const userService = generateUserService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const userToken = (await registerAndLogin())?.accessToken || '';

    userId = tokenUtils.decode<IAccessToken>(userToken).userId;
  });

  afterEach(async () => {
    await userService.deleteManyWithConditions({});
  });

  const exec = async () => sendGetUserRequest(token, userId);

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  describe('should return 403', () => {
    for (let role of ['user', 'author'] as UserRole[]) {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(403);
      });
    }
  });

  describe('should return 404', () => {
    it('if userId is invalid', async () => {
      userId = 'aseqwjequhu3h12ui31qm2da';

      const res = await exec();

      expectNotFoundError(res, /id/i);
    });
    it('if userId does not exist', async () => {
      userId = faker.database.mongodbObjectId();

      const res = await exec();

      expectNotFoundError(res, /id/i);
    });
  });

  describe('should return 200', async () => {
    it('if userId exist in database', async () => {
      const res = await exec();

      expectSuccessGET(res);
    });

    for (let role of adminRoles) {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const res = await exec();

        expectSuccessGET(res);
      });
    }
  });

  it('should return user object in success response', async () => {
    const res = await exec();

    const keys: Array<keyof UserManagementResponseDto> = [
      'username',
      'email',
      'role',
      'avatar',
      'isBanned',
      'createDate',
      'updateDate',
    ];
    expectSuccessGET(res);
    expectKeysExist(res.body.data!, keys);
  });
});

import { faker } from '@faker-js/faker';

// Models
import User from 'features/shared/user/core/user.model';
import Session from 'features/shared/auth/session/session.model';

// Utils
import { UserRole } from 'features/shared/user/core/user.types';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateUserService } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendGetUserRequest } from 'features/management/user/core/tests/user.testUtils';
import {
  clearDbAfterEach,
  describe200,
  describe401,
  describe403,
  describe404,
  expectKeysExist,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';

// Dto
import { UserManagementResponseDto } from 'features/management/user/core/user.management.dto';

// Types
import type { WithPagination } from 'core/types/paginate';

describe('GET /management/users', () => {
  let token: string;
  const userService = generateUserService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
  });

  clearDbAfterEach(User, Session);

  const exec = async (overwriteToken?: string) =>
    sendGetUserRequest<WithPagination<UserManagementResponseDto>>(
      overwriteToken ?? token
    );

  describe200(() => {
    for (let role of adminRoles) {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    }

    itShouldReturnsPaginatedDocs(exec);

    it('and return user object', async () => {
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

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    for (let role of ['user', 'author'] as UserRole[]) {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(403);
      });
    }
  });
});

describe('GET /management/users/:id', () => {
  let token: string;
  let userId: string;
  const userService = generateUserService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    userId = (await registerAndLogin())?.userId || '';
  });

  clearDbAfterEach(User, Session);

  const exec = async (overwriteToken?: string) =>
    sendGetUserRequest(overwriteToken ?? token, userId);

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    for (let role of ['user', 'author'] as UserRole[]) {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(403);
      });
    }
  });

  describe404(() => {
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

  describe200(() => {
    it('if userId exist in database', async () => {
      const res = await exec();

      expectSuccess(res);
    });

    it('and return user object', async () => {
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
      expectSuccess(res);
      expectKeysExist(res.body.data!, keys);
    });

    for (let role of adminRoles) {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const res = await exec();

        expectSuccess(res);
      });
    }
  });
});

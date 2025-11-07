import { faker } from '@faker-js/faker';

// Utils
import tokenUtils from 'core/services/token.service';
import { normalizeUsername } from 'core/utilities/helperPack';
import { sendPatchUserRequest } from 'features/management/user/core/tests/user.testUtils';
import {
  adminRoles,
  generateUserService,
} from 'features/shared/user/core/user.constant';
import {
  generateUser,
  registerAndLogin,
} from 'features/shared/auth/core/tests/auth.testUtils';
import {
  expectBadRequest,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateUserDto } from 'features/management/user/core/user.management.dto';

// Types
import type { IAccessToken } from 'features/shared/auth/session/session.types';
import type {
  UserLeanDocument,
  UserRole,
} from 'features/shared/user/core/user.types';

describe('PATCH /management/users', () => {
  let superAdminToken: string;
  let adminToken: string;
  let userToken: string;
  let before: UserLeanDocument;
  let after: UserLeanDocument;
  let payload: Partial<UpdateUserDto> = {};
  let userId: string;
  const userService = generateUserService();

  beforeEach(async () => {
    const roles: UserRole[] = ['user', 'admin', 'superAdmin'];
    const [user, admin, superAdmin] = await Promise.all(
      roles.map((role) => registerAndLogin({ role }))
    );

    superAdminToken = superAdmin?.accessToken || '';
    adminToken = admin?.accessToken || '';
    userToken = user!.accessToken;
    userId = tokenUtils.decode<IAccessToken>(user!.accessToken).userId;
  });

  afterEach(async () => {
    await userService.deleteManyWithConditions({});
  });

  const exec = async (token: string) => {
    before = await userService.getOneById(userId, {
      select: '+password',
      lean: true,
    });
    const res = await sendPatchUserRequest(userId, { payload, token });
    after = await userService.getOneById(userId, {
      select: '+password',
      lean: true,
    });
    return res;
  };

  it('should return 401 if user does not have token in header', async () => {
    const response = await exec('');

    expectUnauthorizedError(response);
  });

  describe('should return 403', () => {
    it('if role is not [admin,superAdmin]', async () => {
      superAdminToken = (await registerAndLogin())?.accessToken || '';

      const response = await exec(userToken);

      expect(response.status).toBe(403);
    });

    it('admin is trying to update someones role', async () => {
      payload.role = 'admin';

      const response = await exec(adminToken);

      expect(response.status).toBe(403);
    });
  });

  describe('should return 400', () => {
    it('if username is already taken', async () => {
      const newPayload = generateUser();
      await registerAndLogin({ payload: newPayload });
      payload.username = newPayload.username;

      const response = await exec(superAdminToken);

      expectBadRequest(response, /taken/i);
    });
  });

  describe('it should return 200', () => {
    it('even on empty object as payload', async () => {
      payload = {};
      const response = await exec(superAdminToken);
      expect(response.status).toBe(200);
    });

    it('if user payload is valid', async () => {
      payload = {
        bio: faker.person.bio(),
        username: normalizeUsername(faker.internet.username()),
      };
      const response = await exec(superAdminToken);
      expect(response.status).toBe(200);
      expect(after).toEqual(expect.objectContaining(payload));
    });

    it('if superAdmin is trying to update role', async () => {
      payload.role = 'admin';

      const response = await exec(superAdminToken);

      expect(response.status).toBe(200);
      expect(after.role).not.toBe(before.role);
      expect(after.role).toBe(payload.role);
    });
  });

  describe('should not update user', () => {
    for (let role of adminRoles) {
      it(`password if ${role} is trying to`, async () => {
        const newPayload = generateUser();
        (payload as any).password = newPayload.password;

        await exec(role === 'superAdmin' ? superAdminToken : adminToken);

        expect(after.password).toBe(before.password);
      });
      it(`email if ${role} is trying to`, async () => {
        const newPayload = generateUser();
        (payload as any).email = newPayload.email;

        await exec(role === 'superAdmin' ? superAdminToken : adminToken);

        expect(after.email).toBe(before.email);
      });
    }
  });
});

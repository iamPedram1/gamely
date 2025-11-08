import { faker } from '@faker-js/faker';

// Utils
import { generateBanService } from 'features/management/user/ban/ban.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateSessionService } from 'features/shared/auth/session/session.constant';
import {
  describe204,
  describe400,
  describe401,
  describe403,
  describe404,
  expectBadRequest,
  expectForbiddenRequest,
  expectNotFoundError,
  expectUnauthorizedError,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import {
  adminRoles,
  generateUserService,
} from 'features/shared/user/core/user.constant';
import {
  generateBanPayload,
  sendBanRequest,
  sendDeleteBanRequest,
} from 'features/management/user/ban/tests/ban.testUtils';

// Dto
import { CreateBanDto } from 'features/management/user/ban/ban.dto';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('DELETE /bans/:id', () => {
  const userService = generateUserService();
  const banService = generateBanService();
  const sessionService = generateSessionService();
  let token: string;
  let userId: string;
  let payload: CreateBanDto;

  beforeEach(async () => {
    payload = generateBanPayload();
    token = (await registerAndLogin({ role: 'superAdmin' }))?.accessToken || '';
    userId = (await registerAndLogin())?.userId || '';
    await sendBanRequest(userId, { token });
    vi.isFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  const exec = async (overwriteToken?: string) =>
    await sendDeleteBanRequest(userId, { token: overwriteToken ?? token });

  describe204(() => {
    it('and unban the user', async () => {
      const before = await banService.getUserBan(userId);

      const response = await exec();

      const after = await banService.getOneById(before!._id, {
        throwError: false,
      });

      expect(response.status).toBe(204);
      expect(before!.status).toBe('active');
      expect(after).toBeNull();
    });
  });

  describe400(() => {
    for (let role of adminRoles) {
      it(`if ${role} is trying to unban a user which is not banned`, async () => {
        userId = (await registerAndLogin())?.userId || '';

        const res = await exec();

        expectBadRequest(res, /not/i);
      });
    }
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    const forbiddenRoles: UserRole[] = ['user', 'author'];
    for (let role of forbiddenRoles) {
      it(`if user role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expectForbiddenRequest(response);
      });
    }

    it('if admin is trying to unban another admin', async () => {
      token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
      userId = (await registerAndLogin({ role: 'admin' }))?.userId || '';

      const res = await exec();

      expectForbiddenRequest(res, /cannot/i);
    });
  });

  describe404(() => {
    it('if target user does not exist in db', async () => {
      userId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

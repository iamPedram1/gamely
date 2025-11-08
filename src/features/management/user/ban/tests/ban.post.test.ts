import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateBanService } from 'features/management/user/ban/ban.constant';
import { generateSessionService } from 'features/shared/auth/session/session.constant';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  describe404,
  expectBadRequest,
  expectForbiddenRequest,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import {
  generateBanPayload,
  sendBanRequest,
} from 'features/management/user/ban/tests/ban.testUtils';
import {
  adminRoles,
  generateUserService,
} from 'features/shared/user/core/user.constant';

// Dto

import { CreateBanDto } from 'features/management/user/ban/ban.dto';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('POST /bans/:id', () => {
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
    vi.isFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    // await Promise.all([
    //   userService.clearCollection(),
    //   banService.clearCollection(),
    //   sessionService.clearCollection(),
    // ]);
  });

  const exec = async (overwriteToken?: string) =>
    await sendBanRequest(userId, { payload, token: overwriteToken ?? token });

  describe200(() => {
    it('and automatically unban user if "endAt" is passed', async () => {
      const fakeEndDate = faker.date.soon({
        days: 10,
        refDate: payload.startAt,
      });
      payload.endAt = fakeEndDate.toISOString();

      // Ban User
      await exec();
      const before = await banService.checkIsBanned(userId);

      // Set Date to After of endAt
      const afterEndDate = faker.date.soon({ refDate: payload.endAt });
      vi.setSystemTime(dayjs(afterEndDate).add(1, 'minute').toDate());

      // Check is Banned?
      const after = await banService.checkIsBanned(userId);

      expect(before).toBe(true);
      expect(after).toBe(false);
    });

    it('and change ban status to expired after "endAt" is passed', async () => {
      const fakeEndDate = faker.date.soon({
        days: 10,
        refDate: payload.startAt,
      });
      payload.endAt = fakeEndDate.toISOString();

      // Ban User
      await exec();
      const before = await banService.getUserBan(userId);

      // Set date to after of endAt
      const afterEndDate = faker.date.soon({ refDate: payload.endAt });
      vi.setSystemTime(dayjs(afterEndDate).add(1, 'minute').toDate());

      await banService.checkIsBanned(userId);
      const ban = await banService.getOneById(before!._id);

      expect(ban.status).toBe('expired');
    });

    it('and change role to "user" if admin was banned', async () => {
      userId = (await registerAndLogin({ role: 'admin' }))?.userId || '';

      const prev = await userService.getOneById(userId, { lean: true });
      const res = await exec();
      const after = await userService.getOneById(userId, { lean: true });
      const isBanned = await banService.checkIsBanned(userId);

      expectSuccess(res, 204);
      expect(isBanned).toBe(true);
      expect(prev.role).toBe('admin');
      expect(after.role).toBe('user');
    });

    it('and ban user permanently', async () => {
      payload.type = 'permanent';
      delete payload.endAt;

      const response = await exec();

      const ban = await banService.getUserBan(userId);

      expect(response.status).toBe(204);
      expect(ban).toBeDefined();
      expect(ban!.type).toEqual('permanent');
    });

    it('and ban user temporarly', async () => {
      const response = await exec();

      const ban = await banService.getUserBan(userId);

      expect(response.status).toBe(204);
      expect(ban).toBeDefined();
      expect(ban!.type).toBe('temporary');
    });

    it('and clear user sessions after ban', async () => {
      const before = await sessionService.countDocuments({ user: userId });
      await exec();
      const after = await sessionService.countDocuments({ user: userId });

      expect(before).toBeGreaterThan(0);
      expect(after).toBe(0);
    });
  });

  describe400(() => {
    for (let role of adminRoles) {
      it(`if ${role} is trying to ban an already banned user`, async () => {
        await exec(); // Ban For The First Time
        const banTwice = await exec(); // Ban Again

        expectBadRequest(banTwice, /already/i);
      });
    }

    it('if ban startAt is before Date.now', async () => {
      payload.startAt = faker.date.past({ years: 1 }).toISOString();

      const res = await exec();

      expectBadRequest(res);
    });

    it('if ban endAt is before Date.now', async () => {
      payload.endAt = faker.date.past({ years: 1 }).toISOString();

      const res = await exec();

      expectBadRequest(res);
    });

    it('if ban endAt is before startAt', async () => {
      payload.startAt = dayjs().add(5, 'days').toISOString();
      payload.endAt = dayjs().add(3, 'days').toISOString();

      const res = await exec();

      expectBadRequest(res);
    });

    it('if ban startAt is after endAt', async () => {
      payload.startAt = dayjs().add(3, 'days').toISOString();
      payload.endAt = dayjs().add(1, 'days').toISOString();

      const res = await exec();

      expectBadRequest(res);
    });
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

    it('if admin is trying to ban another admin', async () => {
      token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
      userId = (await registerAndLogin({ role: 'admin' }))?.userId || '';

      const res = await exec();

      expectForbiddenRequest(res, /cannot/i);
    });

    it('if admin is trying to ban superAdmin', async () => {
      token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
      userId = (await registerAndLogin({ role: 'superAdmin' }))?.userId || '';

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

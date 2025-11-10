import { faker } from '@faker-js/faker';
import { registerAndLoginBatch } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendFollowRequest } from './follow.testUtils';
import {
  describe204,
  describe400,
  describe401,
  describe404,
  expectBadRequest,
  expectNotFoundError,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('POST /follow/:userId/follow', () => {
  let token: string;
  let actorId: string;
  let targetId: string;

  beforeEach(async () => {
    const [user, target] = await registerAndLoginBatch(2);
    token = user.accessToken;
    actorId = user.userId;
    targetId = target.userId;
  });

  const exec = (overwriteToken?: string) =>
    sendFollowRequest(targetId, overwriteToken ?? token);

  describe204(() => {
    it('and follows another user successfully', async () => {
      const response = await exec();

      expect(response.status).toBe(204);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe400(() => {
    it('cannot follow self', async () => {
      const res = await sendFollowRequest(actorId, token);

      expectBadRequest(res, /self/i);
    });
  });

  describe404(() => {
    it('if target user does not exist', async () => {
      targetId = faker.database.mongodbObjectId();
      const res = await exec();
      expectNotFoundError(res);
    });
  });
});

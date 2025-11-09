import { faker } from '@faker-js/faker';

// Utils
import { generateBlockService } from 'features/shared/user/block/block.constant';
import { registerAndLoginBatch } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe204,
  describe400,
  describe401,
  describe404,
  expectBadRequest,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// Types
import { sendBlockRequest } from 'features/shared/user/block/tests/block.testUtils';

describe('POST /user/blocks/:id', () => {
  const blockService = generateBlockService();
  let token: string;
  let actorId: string;
  let targetId: string;

  beforeEach(async () => {
    const [actor, target] = await registerAndLoginBatch(2);
    token = actor.accessToken;
    actorId = actor.userId;
    targetId = target.userId;
  });

  const exec = async (overwriteToken?: string) =>
    await sendBlockRequest(targetId, { token: overwriteToken ?? token });

  describe204(() => {
    it('and block user', async () => {
      const response = await exec();

      const isBlocked = await blockService.checkIsBlock(actorId, targetId);
      expectSuccess(response, 204);

      expect(isBlocked).toBe(true);
    });
  });

  describe400(() => {
    it(`if its trying to block an already blocked user`, async () => {
      await exec(); // Block for the first time
      const blockTwice = await exec(); // Block again

      expectBadRequest(blockTwice, /already/i);
    });
    it(`if its trying to block itself`, async () => {
      targetId = actorId;
      const res = await exec();

      expectBadRequest(res, /yourself/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe404(() => {
    it('if target user does not exist in db', async () => {
      targetId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

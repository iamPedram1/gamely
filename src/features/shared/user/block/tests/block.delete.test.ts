// Utils
import { registerAndLoginBatch } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateBlockService } from 'features/shared/user/block/block.constant';
import {
  sendBlockRequest,
  sendUnblockRequest,
} from 'features/shared/user/block/tests/block.testUtils';
import {
  describe204,
  describe400,
  describe401,
  describe404,
  expectBadRequest,
  expectSuccess,
  itShouldExist,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('DELETE /bans/:id', () => {
  const blockService = generateBlockService();
  let token: string;
  let actorId: string;
  let targetId: string;

  beforeEach(async () => {
    const [actor, target] = await registerAndLoginBatch(2);
    token = actor.accessToken;
    actorId = actor.userId;
    targetId = target.userId;
    await sendBlockRequest(targetId, { token });
  });

  const exec = async (overwriteToken?: string) =>
    await sendUnblockRequest(targetId, { token: overwriteToken ?? token });

  describe204(() => {
    it('and unblock the user', async () => {
      const before = await blockService.checkIsBlock(actorId, targetId);

      const response = await exec();

      const after = await blockService.checkIsBlock(actorId, targetId);

      expectSuccess(response, 204);
      expect(before).toBe(true);
      expect(after).toBe(false);
    });
  });

  describe400(() => {
    it(`if its trying to unlock a user which its not blocked`, async () => {
      await exec(); // Unblock for the first time

      const blockTwice = await exec(); // Unblock again.

      expectBadRequest(blockTwice, /haven't/i);
    });

    it(`if its trying to unblock itself`, async () => {
      targetId = actorId;

      const res = await exec();

      expectBadRequest(res, /yourself/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe404(() => {
    itShouldExist(exec, 'target user', targetId);
  });
});

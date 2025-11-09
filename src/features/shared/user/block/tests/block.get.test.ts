// Utils
import { registerAndLoginBatch } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe200,
  describe401,
  expectSuccess,
  itShouldRequireToken,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';

// Types
import { generateBlockService } from 'features/shared/user/block/block.constant';
import {
  sendBlockRequest,
  sendGetBlocksRequest,
} from 'features/shared/user/block/tests/block.testUtils';

describe('GET /user/blocks/:id', () => {
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
    await sendGetBlocksRequest({ token: overwriteToken ?? token });

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    it('and return block data correctly', async () => {
      const response = await exec();
      const doc = response.body.data?.docs[0];

      expectSuccess(response);
      expect(doc!.id).toBeDefined();
      expect(doc!.user.id).toBe(targetId);
      expect(doc!.blockedAt).toBeDefined();

      (['id', 'username', 'avatar'] as const).forEach((key) => {
        expect(doc!.user).toHaveProperty(key);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });
});

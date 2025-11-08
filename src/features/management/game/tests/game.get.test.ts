// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateGameService } from 'features/shared/game/core/game.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateGameRequest,
  sendGetGameRequest,
} from 'features/management/game/tests/game.testUtils';
import {
  describe200,
  describe403,
  itShouldRequireManagementRole,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/games', () => {
  let token: string;

  const gameService = generateGameService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateGameRequest({ token });
  });

  const exec = async (overwriteToken?: string) =>
    sendGetGameRequest(overwriteToken ?? token);

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    (['author', ...adminRoles] as UserRole[]).forEach((role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    });

    it('and return game object', async () => {
      const res = await exec();

      ['translations', 'slug', 'id'].forEach((key) => {
        expect(res.body.data?.docs[0]).toHaveProperty(key);
      });
    });
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });
});

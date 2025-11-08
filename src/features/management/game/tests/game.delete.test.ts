import { faker } from '@faker-js/faker';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateGameService } from 'features/shared/game/core/game.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateGameRequest,
  sendDeleteGameRequest,
} from 'features/management/game/tests/game.testUtils';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  describe404,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('DELETE /management/games', () => {
  const gameService = generateGameService();

  let token: string;
  let payload: { gameId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateGameRequest({ token });

    payload = { gameId: response.body.data?.id as string };
  });

  const exec = async (overwriteToken?: string) =>
    sendDeleteGameRequest(payload.gameId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the game', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      payload.gameId = (await sendCreateGameRequest({ token })).body.data
        ?.id as string;

      const response = await exec();

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toMatch(/success/i);
    });

    adminRoles.forEach((role) => {
      it(`and delete game if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const game = await gameService.getOneById(payload.gameId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(game).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    });
  });

  describe400(() => {
    it('if role is author but you dont own the game', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      const response = await exec();

      expect(response.status).toBe(400);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toMatch(/you didn't/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });

  describe404(() => {
    it('if game does not exist', async () => {
      payload.gameId = faker.database.mongodbObjectId();

      const response = await exec();

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
    });
  });
});

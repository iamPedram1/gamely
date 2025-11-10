// Utils

import { faker } from '@faker-js/faker';
import {
  describe204,
  describe400,
  describe401,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import {
  sendFavoriteGameRequest,
  sendUnfavoriteGameRequest,
} from 'features/client/user/favoriteGame/tests/favoriteGame.client.testUtils';
import { generateUserAndGame } from 'features/management/game/tests/game.testUtils';
import FavoriteGameService from 'features/shared/user/favoriteGame/favoriteGame.service';

describe('DELETE /user/favorite-games/:gameId', () => {
  let token: string;
  let gameId: string;
  let favoriteService: FavoriteGameService;
  let actorId: string;

  beforeEach(async () => {
    const { user, gameId: id } = await generateUserAndGame();
    token = user.accessToken;
    actorId = user.userId;
    gameId = id;
    favoriteService = new FavoriteGameService();
  });

  const exec = async (overwriteToken?: string) =>
    sendUnfavoriteGameRequest(gameId, { token: overwriteToken ?? token });

  describe204(() => {
    it('should unfavorite the game successfully', async () => {
      await sendFavoriteGameRequest(gameId, { token });
      const response = await exec();
      expect(response.status).toBe(204);

      const isFavorited = await favoriteService.checkIsGameFavorited(
        actorId,
        gameId
      );
      expectSuccess(response, 204);
      expect(isFavorited).toBe(false);
    });
  });

  describe400(() => {
    it('if the game is not favorited', async () => {
      await exec();
      const response = await exec();
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/haven't/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe404(() => {
    it('if the game does not exist', async () => {
      gameId = faker.database.mongodbObjectId();

      const res = await exec();

      expectNotFoundError(res);
    });
  });
});

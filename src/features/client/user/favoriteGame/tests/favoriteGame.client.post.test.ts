import { faker } from '@faker-js/faker';

// Utils
import FavoriteGameService from 'features/shared/user/favoriteGame/favoriteGame.service';
import { generateUserAndGame } from 'features/management/game/tests/game.testUtils';
import { sendFavoriteGameRequest } from 'features/client/user/favoriteGame/tests/favoriteGame.client.testUtils';
import {
  describe204,
  describe400,
  describe401,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('POST /user/favorite-games/:gameId', () => {
  let token: string;
  let actorId: string;
  let gameId: string;
  let favoriteService: FavoriteGameService;

  beforeEach(async () => {
    const { user, gameId: id } = await generateUserAndGame();
    token = user.accessToken;
    gameId = id;
    actorId = user.userId;
    favoriteService = new FavoriteGameService();
  });

  const exec = async (overwriteToken?: string) =>
    sendFavoriteGameRequest(gameId, { token: overwriteToken ?? token });

  describe204(() => {
    it('and favorite a game successfully', async () => {
      const response = await exec();
      const isFavorited = await favoriteService.checkIsGameFavorited(
        actorId,
        gameId
      );

      expectSuccess(response, 204);
      expect(isFavorited).toBe(true);
    });
  });

  describe400(() => {
    it('and shouldnt allow favoriting the same game twice', async () => {
      await exec();
      const response = await exec();
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already/i);
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

// Utils
import { generateUserService } from 'features/shared/user/core/user.constant';
import { generateUserAndGame } from 'features/management/game/tests/game.testUtils';
import {
  describe200,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';
import {
  sendFavoriteGameRequest,
  sendGetFavoriteGamesRequest,
} from 'features/client/user/favoriteGame/tests/favoriteGame.client.testUtils';
import { faker } from '@faker-js/faker';

describe('GET /user/:username/favorite-games', () => {
  let username: string;
  let token: string;
  let gameId: string;
  const userService = generateUserService();

  beforeEach(async () => {
    const { user, gameId: id } = await generateUserAndGame();
    username = (await userService.getOneById(user.userId, { lean: true }))
      .username;
    token = user.accessToken;
    gameId = id;
    await sendFavoriteGameRequest(gameId, { token });
  });

  const exec = async () => sendGetFavoriteGamesRequest(username);

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    it('and return the favorite games of a user', async () => {
      const response = await exec();

      expectSuccess(response);
      expect(response.body.data!.docs.length).toBeGreaterThan(0);
    });
  });

  describe404(() => {
    itShouldReturnsPaginatedDocs(exec);

    it('if the user does not exists', async () => {
      username = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

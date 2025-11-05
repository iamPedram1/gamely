import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import GameService from 'features/shared/game/core/game.service';

// Utils
import {
  expectUnauthorizedError,
  registerAndLogin,
  sendCreateGameRequest,
  sendDeleteGameRequest,
} from 'core/utilities/testHelpers';

// DTO
import { adminRoles } from 'features/shared/user/core/user.constant';

describe('DELETE /management/games', () => {
  const gameService = container.resolve(GameService);

  let token: string;
  let payload: { gameId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))!.accessToken;

    const response = await sendCreateGameRequest({ token });

    payload = { gameId: response.body.data!.id };
  });

  const exec = async () => sendDeleteGameRequest(payload.gameId, token);

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())!.accessToken;

    const response = await exec();

    expect(response.status).toBe(403);
  });

  it('should return 400 if role is author but you dont own the game', async () => {
    token = (await registerAndLogin({ role: 'author' }))!.accessToken;

    const response = await exec();

    expect(response.status).toBe(400);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.message).toMatch(/you didn't/i);
  });

  it('should return 200 if role is author and you own the game', async () => {
    token = (await registerAndLogin({ role: 'author' }))!.accessToken;

    payload.gameId = (await sendCreateGameRequest({ token })).body.data!.id;

    const response = await exec();

    expect(response.status).toBe(200);
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.message).toMatch(/success/i);
  });

  describe.each(adminRoles)(
    'should return 200 and delete game if',
    async (role) => {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))!.accessToken;

        const response = await exec();
        const game = await gameService.getOneById(payload.gameId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(game).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    }
  );

  it('should return 404 if game does not exist', async () => {
    payload.gameId = faker.database.mongodbObjectId();

    const response = await exec();

    expect(response.status).toBe(404);
    expect(response.body.isSuccess).toBe(false);
  });
});

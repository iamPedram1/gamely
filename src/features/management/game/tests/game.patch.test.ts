import { faker } from '@faker-js/faker';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { generateGameService } from 'features/shared/game/core/game.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  describe404,
  expectBadRequest,
  expectNotFoundError,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import {
  sendCreateGameRequest,
  sendPatchGameRequest,
} from 'features/management/game/tests/game.testUtils';

// DTO
import { UpdateGameDto } from 'features/management/game/game.management.dto';

describe('PATCH /management/games', () => {
  let token: string;
  let payload: UpdateGameDto = {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
  };
  let gameId: string;
  const gameService = generateGameService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateGameRequest({ token });
    payload.slug = response.body.data!.slug;
    payload.translations = response.body.data?.translations;
    payload.coverImage = response.body.data?.coverImage.id;
    payload.releaseDate = response.body.data?.releaseDate;

    gameId = response.body.data?.id as string;
  });

  const exec = async (overwriteToken?: string) =>
    sendPatchGameRequest(gameId, { payload, token: overwriteToken ?? token });

  describe200(() => {
    it('if slug update is valid', async () => {
      delete payload.slug;
      delete payload.releaseDate;
      delete payload.translations;

      payload.slug = faker.lorem.slug({ min: 2, max: 4 });

      const response = await exec();
      const game = await gameService.getOneById(gameId, {
        lean: true,
      });

      expect(response.status).toBe(200);
      expect(game).toBeDefined();
      if (payload.slug) expect(game.slug).toBe(payload.slug);
      if (payload.releaseDate)
        expect(game.releaseDate.toISOString()).toBe(payload.releaseDate);
      if (payload.coverImage)
        expect(String(game.coverImage?._id)).toBe(payload.coverImage);
      if (payload.translations)
        expect(game.translations).toMatchObject(payload.translations);
    });

    it('even on empty object', async () => {
      payload = {};
      const response = await exec();
      expect(response.status).toBe(200);
    });
  });

  describe400(() => {
    it('if the slug is already taken', async () => {
      const game = await sendCreateGameRequest({ token });
      payload.slug = game.body.data!.slug;

      const response = await exec();

      expectBadRequest(response, /taken/i);
    });

    appLanguages.forEach((lang) => {
      it(`if translations.${lang}.title is not valid`, async () => {
        payload.translations![lang] = { title: 'ab' };
        delete payload.slug;
        delete payload.releaseDate;
        delete payload.coverImage;
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
      it(`if translations.${lang}.description is not valid`, async () => {
        payload.translations![lang] = { description: 'a' };
        delete payload.slug;
        const response = await exec();
        expectBadRequest(response, /description/i);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });

  describe404(() => {
    it('if game id is not valid', async () => {
      gameId = faker.database.mongodbObjectId();

      const res = await exec();

      expectNotFoundError(res);
    });
  });
});

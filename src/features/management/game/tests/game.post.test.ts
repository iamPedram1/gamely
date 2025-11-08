// Utils
import { appLanguages } from 'core/startup/i18n';
import { generateGameService } from 'features/shared/game/core/game.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generateGame,
  sendCreateGameRequest,
} from 'features/management/game/tests/game.testUtils';
import {
  describe201,
  describe400,
  describe403,
  expectBadRequest,
  itShouldRequireManagementRole,
} from 'core/utilities/testHelpers';

// DTO
import { CreateGameDto } from 'features/management/game/game.management.dto';

describe('POST /management/games', () => {
  let token: string;
  let payload: CreateGameDto;
  const gameService = generateGameService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
    payload = await generateGame(token);
  });

  const exec = async (overwriteToken?: string) =>
    sendCreateGameRequest({ payload, token: overwriteToken ?? token });

  describe201(() => {
    it('if the payload is valid', async () => {
      const response = await exec();
      const game = await gameService.getOneBySlug(payload.slug, { lean: true });

      expect(response.status).toBe(201);
      expect(game.slug).toEqual(payload.slug);
      expect(game.translations).toMatchObject(payload.translations);
      expect(game.releaseDate.toISOString()).toEqual(payload.releaseDate);
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
        payload.translations[lang].title = 'ab';
        const response = await exec();

        expectBadRequest(response, /title/i);
      });
      it(`if translations.${lang}.description is not valid`, async () => {
        payload.translations[lang].description = 'a';

        const response = await exec();

        expectBadRequest(response, /description/i);
      });
    });
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });
});

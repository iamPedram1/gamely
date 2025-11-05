import { container } from 'tsyringe';

// Services
import GameService from 'features/shared/game/core/game.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import {
  expectBadRequest,
  generateGame,
  registerAndLogin,
  sendCreateGameRequest,
} from 'core/utilities/testHelpers';

// DTO
import { CreateGameDto } from 'features/management/game/game.management.dto';

describe('POST /management/games', () => {
  let token: string;
  let payload: CreateGameDto;
  const gameService = container.resolve(GameService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))!.accessToken;
    payload = await generateGame(token);
  });

  const exec = async () => sendCreateGameRequest({ payload, token });

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())!.accessToken;

    const response = await exec();

    expect(response.status).toBe(403);
  });

  it('should return 400 if the slug is already taken', async () => {
    const game = await sendCreateGameRequest({ token });
    payload.slug = game.body.data!.slug;

    const response = await exec();

    expectBadRequest(response, /taken/i);
  });

  describe.each(appLanguages)(
    'should return 400 if translations.%s.title is not valid',
    (lang) => {
      it(`fails for ${lang}`, async () => {
        payload.translations[lang].title = 'ab';
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
    }
  );

  describe.each(appLanguages)(
    'should return 400 if translations.%s.description is not valid',
    (lang) => {
      it(`fails for ${lang}`, async () => {
        payload.translations[lang].description = 'a';
        const response = await exec();
        expectBadRequest(response, /description/i);
      });
    }
  );

  it('should return 201 if the payload is valid', async () => {
    payload.translations.fa.title = 'اوت لست';
    const response = await exec();
    const game = await gameService.getOneBySlug(payload.slug, { lean: true });

    expect(response.status).toBe(201);
    expect(game.slug).toEqual(payload.slug);
    expect(game.translations).toMatchObject(payload.translations);
    expect(game.releaseDate.toISOString()).toEqual(payload.releaseDate);
  });
});

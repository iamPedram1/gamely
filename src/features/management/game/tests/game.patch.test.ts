import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services

// Utils
import { appLanguages } from 'core/startup/i18n';
import {
  expectBadRequest,
  expectUnauthorizedError,
  generateGame,
  registerAndLogin,
  sendCreateGameRequest,
  sendPatchGameRequest,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateGameDto } from 'features/management/game/game.management.dto';
import GameService from 'features/shared/game/core/game.service';

describe('PATCH /management/games', () => {
  let token: string;
  let payload: UpdateGameDto = {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
  };
  let gameId: string;
  const gameService = container.resolve(GameService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))!.accessToken;

    const response = await sendCreateGameRequest({ token });
    payload.slug = response.body.data!.slug;
    payload.translations = response.body.data!.translations;
    payload.coverImage = response.body.data!.coverImage.id;
    payload.releaseDate = response.body.data!.releaseDate;

    gameId = response.body.data!.id;
  });

  const exec = async () => sendPatchGameRequest(gameId, { payload, token });

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
        payload.translations![lang] = { title: 'ab' };
        delete payload.slug;
        delete payload.releaseDate;
        delete payload.coverImage;
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
    }
  );
  describe.each(appLanguages)(
    'should return 400 if translations.%s.description is not valid',
    (lang) => {
      it(`fails for ${lang}`, async () => {
        payload.translations![lang] = { description: 'a' };
        delete payload.slug;
        const response = await exec();
        expectBadRequest(response, /description/i);
      });
    }
  );

  it('should return 200 if slug update is valid', async () => {
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

  it('should return 200 even on empty object', async () => {
    payload = {};
    const response = await exec();
    expect(response.status).toBe(200);
  });
});

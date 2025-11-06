import { faker, fakerFA } from '@faker-js/faker';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generatePostService } from 'features/shared/post/core/post.constant';
import { sendCreateTagRequest } from 'features/management/tag/tests/tag.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
import { sendCreateCategoryRequest } from 'features/management/category/tests/category.testUtilts';
import {
  generatePostData,
  generatePostRequirements,
  sendCreatePostRequest,
  sendPatchPostRequest,
} from 'features/management/post/core/tests/post.testUtils';
import {
  expectBadRequest,
  expectNotFoundError,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { UpdatePostDto } from 'features/management/post/core/post.management.dto';

describe('PATCH /management/posts', () => {
  let token: string;
  let payload: UpdatePostDto;
  let id: string;
  const postService = generatePostService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
    payload = await generatePostData(token);
    id = (await sendCreatePostRequest({ payload, token })).body.data?.id || '';
    const { game, tag, category, coverImage } =
      await generatePostRequirements(token);

    // Updating
    payload.coverImage = coverImage.body.data?.id || '';
    payload.tags = [tag.body.data?.id || ''];
    payload.game = game.body.data?.id || '';
    payload.category = category.body.data?.id || '';
    payload.translations.en.title = faker.lorem.sentence({
      min: 1,
      max: 5,
    });
    payload.translations.en.abstract = faker.lorem.sentence({
      min: 2,
      max: 5,
    });
    payload.translations.en.content = faker.lorem.lines({ min: 3, max: 5 });
    payload.translations.fa.title = fakerFA.lorem.sentence({
      min: 1,
      max: 5,
    });
    payload.translations.fa.abstract = fakerFA.lorem.sentence({
      min: 2,
      max: 5,
    });
    payload.translations.fa.content = fakerFA.lorem.lines({ min: 3, max: 5 });
    ++payload.readingTime;
  });

  const exec = async () => sendPatchPostRequest(id, { payload, token });

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(403);
  });

  it('should return 404 if slug is already taken', async () => {
    const post = await sendCreatePostRequest({ token });
    payload.slug = post.body.data!.slug;

    const response = await exec();

    expectBadRequest(response, /taken/i);
  });

  describe('should return 404 if', () => {
    (['game', 'coverImage', 'category', 'tags'] as const).forEach((key) => {
      it(`${key} is not valid`, async () => {
        if (key === 'tags') payload[key] = [faker.database.mongodbObjectId()];
        else payload[key] = faker.database.mongodbObjectId();

        const response = await exec();

        expectNotFoundError(
          response,
          new RegExp(key === 'tags' ? 'tag' : key, 'i')
        );
      });
    });
  });

  describe.each(['title', 'abstract', 'content'] as const)(
    'should return 400 if %s is invalid',
    (key) => {
      for (let lang of appLanguages) {
        it(`in ${lang}`, async () => {
          payload.translations[lang][key] = '';

          const response = await sendPatchPostRequest(id, {
            payload: payload,
            token,
          });
          expectBadRequest(response, new RegExp(key, 'i'));
        });
      }
    }
  );

  it('should return 200 if payload is valid', async () => {
    const before = await postService.getOneBySlug(payload.slug, {
      lean: true,
    });
    const response = await exec();
    const after = await postService.getOneBySlug(payload.slug, {
      lean: true,
    });

    expect(response.status).toBe(200);
    expect(after).toBeDefined();
    expect(after.readingTime).toBe(payload.readingTime);

    describe.each(appLanguages)('check translations update', (lang) => {
      it(`in ${lang}`, async () => {
        expect(after.translations[lang]).toMatchObject(
          payload.translations[lang]
        );
        expect(before.translations[lang]).not.toMatchObject(
          after.translations[lang]
        );
      });
    });

    describe.each(['game', 'category', 'tags', 'coverImage'] as const)(
      'check updates',
      (key) => {
        it(`in ${key}`, async () => {
          expect(after[key]).not.toEqual(before[key]);
        });
      }
    );
  });
});

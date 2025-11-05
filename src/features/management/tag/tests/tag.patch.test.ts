import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendPatchTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import {
  expectBadRequest,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateTagDto } from 'features/management/tag/tag.management.dto';

describe('PATCH /management/tags', () => {
  let token: string;
  let payload: UpdateTagDto = {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
  };
  let tagId: string;
  const tagService = container.resolve(TagService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateTagRequest({ token });
    payload.slug = response.body.data!.slug;
    payload.translations = response.body.data!.translations;

    tagId = response.body.data!.id;
  });

  const exec = async () => sendPatchTagRequest(tagId, { payload, token });

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

  it('should return 400 if the slug is already taken', async () => {
    const tag = await sendCreateTagRequest({ token });
    payload.slug = tag.body.data!.slug;

    const response = await exec();

    expectBadRequest(response, /taken/i);
  });

  describe.each(appLanguages)(
    'should return 400 if translations.%s.title is not valid',
    (lang) => {
      it(`fails for ${lang}`, async () => {
        payload.translations![lang] = { title: 'ab' };
        delete payload.slug;
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
    }
  );

  it('should return 200 if slug update is valid', async () => {
    delete payload.translations;
    payload.slug = faker.lorem.slug({ min: 2, max: 4 });

    const response = await exec();
    const tag = await tagService.getOneById(tagId, {
      lean: true,
    });

    expect(response.status).toBe(200);
    expect(tag).toBeDefined();
    if (payload.slug) expect(tag.slug).toBe(payload.slug);
    if (payload.translations)
      expect(tag.translations).toMatchObject(payload.translations);
  });

  it('should return 200 even on empty object', async () => {
    payload = {};
    const response = await exec();
    expect(response.status).toBe(200);
  });
});

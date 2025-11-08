import { faker } from '@faker-js/faker';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { generateTagService } from 'features/shared/tag/tag.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendPatchTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  expectBadRequest,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateTagDto } from 'features/management/tag/tag.management.dto';

describe('PATCH /management/tags', () => {
  let token: string;
  let payload: UpdateTagDto = {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
  };
  let tagId: string;
  const tagService = generateTagService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateTagRequest({ token });
    payload.slug = response.body.data!.slug;
    payload.translations = response.body.data?.translations;

    tagId = response.body.data?.id as string;
  });

  const exec = async (overwriteToken?: string) =>
    sendPatchTagRequest(tagId, { payload, token: overwriteToken ?? token });

  describe200(() => {
    it('if slug update is valid', async () => {
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

    it('even on empty object', async () => {
      payload = {};
      const response = await exec();
      expect(response.status).toBe(200);
    });
  });

  describe400(() => {
    it('if the slug is already taken', async () => {
      const tag = await sendCreateTagRequest({ token });
      payload.slug = tag.body.data!.slug;

      const response = await exec();

      expectBadRequest(response, /taken/i);
    });

    appLanguages.forEach((lang) => {
      it(`if translations.${lang}.title is not valid`, async () => {
        payload.translations![lang] = { title: 'ab' };
        delete payload.slug;
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });
});

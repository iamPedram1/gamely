// Utils
import { appLanguages } from 'core/startup/i18n';
import { generateTagService } from 'features/shared/tag/tag.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generateTag,
  sendCreateTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import {
  describe201,
  describe400,
  describe401,
  describe403,
  expectBadRequest,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { CreateTagDto } from 'features/management/tag/tag.management.dto';

describe('POST /management/tags', () => {
  let token: string;
  let payload: CreateTagDto;
  const tagService = generateTagService();

  beforeEach(async () => {
    payload = generateTag();

    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
  });

  const exec = async (overwriteToken?: string) =>
    sendCreateTagRequest({ payload, token: overwriteToken ?? token });

  describe201(() => {
    it('if the payload is valid', async () => {
      const response = await exec();
      const tag = await tagService.getOneBySlug(payload.slug);

      expect(response.status).toBe(201);
      expect(tag).toBeDefined();
      expect(tag).toMatchObject(payload);
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
        payload.translations[lang].title = 'ab';
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

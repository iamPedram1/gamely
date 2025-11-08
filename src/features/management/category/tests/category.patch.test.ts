import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateCategoryRequest,
  sendPatchCategoryRequest,
} from 'features/management/category/tests/category.testUtilts';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  expectBadRequest,
  itShouldRequireToken,
  itShouldRequireManagementRole,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateCategoryDto } from 'features/management/category/category.management.dto';

describe('PATCH /management/categories', () => {
  let token: string;
  let payload: UpdateCategoryDto = {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
  };
  let categoryId: string;
  const categoryService = container.resolve(CategoryService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateCategoryRequest({ token });
    payload.slug = response.body.data!.slug;
    payload.parentId = response.body.data?.parentId;
    payload.translations = response.body.data?.translations;

    categoryId = response.body.data?.id as string;
  });

  const exec = async (overwriteToken?: string) =>
    sendPatchCategoryRequest(categoryId, {
      payload,
      token: overwriteToken ?? token,
    });

  describe200(() => {
    it('if the parentId is valid', async () => {
      const res = await sendCreateCategoryRequest({ token });
      payload.parentId = res.body.data?.id as string;

      const response = await exec();
      const category = await categoryService.getOneById(categoryId, {
        lean: true,
      });

      expect(response.status).toBe(200);
      if (payload.slug) expect(category.slug).toBe(payload.slug);
      if (payload.parentId)
        expect(category.parentId?.toHexString()).toBe(payload.parentId);
      if (payload.translations)
        expect(category.translations).toMatchObject(payload.translations);
    });

    it('if slug update is valid', async () => {
      delete payload.parentId;
      delete payload.translations;
      payload.slug = faker.lorem.slug({ min: 2, max: 4 });

      const response = await exec();
      const category = await categoryService.getOneById(categoryId, {
        lean: true,
      });

      expect(response.status).toBe(200);
      expect(category).toBeDefined();
      if (payload.slug) expect(category.slug).toBe(payload.slug);
      if (payload.parentId)
        expect(String(category.parentId)).toBe(payload.parentId);
      if (payload.translations)
        expect(category.translations).toMatchObject(payload.translations);
    });

    it('even on empty object', async () => {
      payload = {};
      const response = await exec();
      expect(response.status).toBe(200);
    });
  });

  describe400(() => {
    it('if the slug is already taken', async () => {
      const category = await sendCreateCategoryRequest({ token });
      payload.slug = category.body.data!.slug;

      const response = await exec();

      expectBadRequest(response, /taken/i);
    });

    it('if the parentId does not exist', async () => {
      payload.parentId = faker.internet.jwt();

      const response = await exec();

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/parent/i);
    });

    appLanguages.forEach((lang) => {
      it(`if translations.${lang}.title is not valid`, async () => {
        payload.translations![lang] = { title: 'ab' };
        delete payload.parentId;
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

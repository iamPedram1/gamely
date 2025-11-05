import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generateCategory,
  sendCreateCategoryRequest,
} from 'features/management/category/tests/category.testUtilts';
import {
  expectBadRequest,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { CreateCategoryDto } from 'features/management/category/category.management.dto';

describe('POST /management/categories', () => {
  let token: string;
  let payload: CreateCategoryDto;
  const categoryService = container.resolve(CategoryService);

  beforeEach(async () => {
    payload = generateCategory();

    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';
  });

  const exec = async () => sendCreateCategoryRequest({ payload, token });

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
    const category = await sendCreateCategoryRequest({ token });
    payload.slug = category.body.data!.slug;

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

  it('should return 400 if the parentId does not exist', async () => {
    payload.parentId = faker.internet.jwt();

    const response = await exec();

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/parent/i);
  });

  it('should return 201 if the parentId is valid', async () => {
    const res = await sendCreateCategoryRequest({ token });
    payload.parentId = res.body.data!.id;

    const response = await exec();
    const category = await categoryService.getOneBySlug(payload.slug, {
      lean: true,
    });

    expect(response.status).toBe(201);
    expect(category.slug).toBe(payload.slug);
    expect(category.parentId?.toHexString()).toBe(payload.parentId);
    expect(category.translations).toMatchObject(payload.translations);
  });

  it('should return 201 if the payload is valid', async () => {
    const response = await exec();
    const category = await categoryService.getOneBySlug(payload.slug);

    expect(response.status).toBe(201);
    expect(category).toBeDefined();
    expect(category).toMatchObject(payload);
  });

  it('should return 201 even if parentId is missing', async () => {
    delete (payload as any).parentId;
    const response = await exec();
    expect(response.status).toBe(201);
  });
});

import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateCategoryRequest,
  sendGetCategoryRequest,
} from 'features/management/category/tests/category.testUtilts';

describe('GET /management/categories', () => {
  let token: string;
  const categoryService = container.resolve(CategoryService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateCategoryRequest({ token });
  });

  const exec = async () => sendGetCategoryRequest(token);

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

  it('should return 200 if role is author', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(200);
  });

  it('should return 200 if role is [admin,superAdmin]', async () => {
    const response = await exec();

    expect(response.status).toBe(200);
  });

  it('should return pagination if authorized', async () => {
    const response = await exec();

    expect(response.body.data!.pagination).toBeDefined();
    expect(response.body.data!.pagination.totalDocs).toBeGreaterThan(0);
  });

  it('should return docs if authorized', async () => {
    const response = await exec();

    expect(response.body.data!.docs).toBeDefined();
    expect(Array.isArray(response.body.data!.docs)).toBe(true);
    expect(response.body.data!.docs.length).toBeGreaterThan(0);
    expect(response.body.data!.pagination.totalDocs).toBeGreaterThan(0);

    ['translations', 'slug', 'id'].forEach((key) => {
      expect(response.body.data!.docs[0]).toHaveProperty(key);
    });
  });
});

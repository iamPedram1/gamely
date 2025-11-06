import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateCategoryRequest,
  sendDeleteCategoryRequest,
} from 'features/management/category/tests/category.testUtilts';

describe('DELETE /management/categories', () => {
  const categoryService = container.resolve(CategoryService);

  let token: string;
  let payload: { categoryId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateCategoryRequest({ token });

    payload = { categoryId: response.body.data?.id as string };
  });

  const exec = async () => sendDeleteCategoryRequest(payload.categoryId, token);

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

  it('should return 400 if role is author but you dont own the category', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(400);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.message).toMatch(/you didn't/i);
  });

  it('should return 200 if role is author and you own the category', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    payload.categoryId = (await sendCreateCategoryRequest({ token })).body.data
      ?.id as string;

    const response = await exec();

    expect(response.status).toBe(200);
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.message).toMatch(/success/i);
  });

  describe.each(adminRoles)(
    'should return 200 and delete category if',
    async (role) => {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const category = await categoryService.getOneById(payload.categoryId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(category).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    }
  );

  it('should return 404 if category does not exist', async () => {
    payload.categoryId = faker.database.mongodbObjectId();

    const response = await exec();

    expect(response.status).toBe(404);
    expect(response.body.isSuccess).toBe(false);
  });
});

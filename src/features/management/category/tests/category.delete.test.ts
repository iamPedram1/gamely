import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe401,
  describe403,
  itShouldRequireToken,
  itShouldRequireManagementRole,
  describe404,
  describe200,
  expectNotFoundError,
  itShouldOwn,
} from 'core/utilities/testHelpers';
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

  const exec = async (overwriteToken?: string) =>
    sendDeleteCategoryRequest(payload.categoryId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the category', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      payload.categoryId = (await sendCreateCategoryRequest({ token })).body
        .data?.id as string;

      const response = await exec();

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toMatch(/success/i);
    });

    adminRoles.forEach((role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const category = await categoryService.getOneById(payload.categoryId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(category).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
    itShouldOwn('author', exec, 'category');
  });

  describe404(() => {
    it('if category does not exist', async () => {
      payload.categoryId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

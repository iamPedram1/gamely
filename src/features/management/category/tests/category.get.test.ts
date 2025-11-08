import { container } from 'tsyringe';

// Services
import CategoryService from 'features/shared/category/category.service';

// Utils
import {
  describe200,
  describe401,
  describe403,
  expectSuccess,
  itShouldRequireToken,
  itShouldRequireManagementRole,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateCategoryRequest,
  sendGetCategoryRequest,
} from 'features/management/category/tests/category.testUtilts';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/categories', () => {
  let token: string;
  const categoryService = container.resolve(CategoryService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateCategoryRequest({ token });
  });

  const exec = async (overwriteToken?: string) =>
    sendGetCategoryRequest(overwriteToken ?? token);

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });

  describe200(() => {
    (['author', ...adminRoles] as UserRole[]).forEach((role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const res = await exec();

        expectSuccess(res);
      });
    });

    itShouldReturnsPaginatedDocs(exec);
  });
});

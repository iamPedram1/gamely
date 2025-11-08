// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateTagService } from 'features/shared/tag/tag.constant';
import {
  describe200,
  describe401,
  describe403,
  itShouldRequireManagementRole,
  itShouldRequireToken,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendGetTagRequest,
} from 'features/management/tag/tests/tag.testUtils';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/tags', () => {
  let token: string;
  const tagService = generateTagService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateTagRequest({ token });
  });

  const exec = async (overwriteToken?: string) =>
    sendGetTagRequest(overwriteToken ?? token);

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    (['author', ...adminRoles] as UserRole[]).forEach(async (role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
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

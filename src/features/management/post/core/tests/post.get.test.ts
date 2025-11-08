// Utils
import { appLanguages } from 'core/startup/i18n';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generatePostService } from 'features/shared/post/core/post.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe200,
  describe401,
  describe403,
  itShouldRequireManagementRole,
  itShouldRequireToken,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';
import {
  sendCreatePostRequest,
  sendGetPostRequest,
} from 'features/management/post/core/tests/post.testUtils';

// Dto
import { PostManagementResponseDto } from 'features/management/post/core/post.management.dto';

// Types
import type { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/posts', () => {
  let token: string;
  const postService = generatePostService();
  let post: PostManagementResponseDto;

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    post = (await sendCreatePostRequest({ token })).body.data!;
  });

  const exec = async (overwriteToken?: string) =>
    sendGetPostRequest(overwriteToken ?? token);

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    (['author', ...adminRoles] as UserRole[]).forEach((role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    });

    it('should not return post content', async () => {
      const response = await exec();

      expect(response.body.data?.docs.length).toBeGreaterThan(0);

      describe.each(appLanguages)('should not return post content', (lang) => {
        it(`in translations[${lang}]`, async () => {
          expect(
            response.body.data?.docs?.[0].translations?.[lang]?.content
          ).not.toHaveProperty('');
        });
      });
    });
  });
});

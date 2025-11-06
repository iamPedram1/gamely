// Utils
import { appLanguages } from 'core/startup/i18n';
import { UserRole } from 'features/shared/user/core/user.types';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { generatePostService } from 'features/shared/post/core/post.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreatePostRequest,
  sendGetPostRequest,
} from 'features/management/post/core/tests/post.testUtils';

// Dto
import { PostManagementResponseDto } from 'features/management/post/core/post.management.dto';

describe('GET /management/posts', () => {
  let token: string;
  const postService = generatePostService();
  let post: PostManagementResponseDto;

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    post = (await sendCreatePostRequest({ token })).body.data!;
  });

  const exec = async () => sendGetPostRequest(token);

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

  describe.each(['author', ...adminRoles] as UserRole[])(
    'should return 200',
    async (role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    }
  );

  it('should return pagination if authorized', async () => {
    const response = await exec();

    expect(response.body.data?.pagination).toBeDefined();
    expect(response.body.data?.pagination.totalDocs).toBeGreaterThan(0);
  });

  it('should return docs if authorized', async () => {
    const response = await exec();

    expect(response.body.data?.docs).toBeDefined();
    expect(Array.isArray(response.body.data?.docs)).toBe(true);
    expect(response.body.data?.docs.length).toBeGreaterThan(0);
    expect(response.body.data?.pagination.totalDocs).toBeGreaterThan(0);
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

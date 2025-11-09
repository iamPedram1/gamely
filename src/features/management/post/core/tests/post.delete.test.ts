import { faker } from '@faker-js/faker';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generatePostService } from 'features/shared/post/core/post.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreatePostRequest,
  sendDeletePostRequest,
} from 'features/management/post/core/tests/post.testUtils';
import {
  describe200,
  describe401,
  describe403,
  describe404,
  itShouldRequireToken,
  itShouldRequireManagementRole,
  expectNotFoundError,
  itShouldOwn,
} from 'core/utilities/testHelpers';

describe('DELETE /management/posts', () => {
  const postService = generatePostService();

  let token: string;
  let payload: { postId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const res = await sendCreatePostRequest({ token });

    payload = { postId: res.body.data?.id || '' };
  });

  const exec = async (overwriteToken?: string) =>
    sendDeletePostRequest(payload.postId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the post', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      payload.postId = (await sendCreatePostRequest({ token })).body.data
        ?.id as string;

      const response = await exec();

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toMatch(/success/i);
    });

    adminRoles.forEach((role) => {
      it(`and delete post if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const post = await postService.getOneById(payload.postId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(post).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
    itShouldOwn('author', exec, 'post');
  });

  describe404(() => {
    it('if post does not exist', async () => {
      payload.postId = faker.database.mongodbObjectId();

      const response = await exec();
      expectNotFoundError(response);
    });
  });
});

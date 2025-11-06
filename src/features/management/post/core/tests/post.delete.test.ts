import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import PostService from 'features/shared/post/core/post.service';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreatePostRequest,
  sendDeletePostRequest,
} from 'features/management/post/core/tests/post.testUtils';

describe('DELETE /management/posts', () => {
  const postService = container.resolve(PostService);

  let token: string;
  let payload: { postId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const res = await sendCreatePostRequest({ token });

    payload = { postId: res.body.data?.id || '' };
  });

  const exec = async () => sendDeletePostRequest(payload.postId, token);

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

  it('should return 400 if role is author but you dont own the post', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(400);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.message).toMatch(/you didn't/i);
  });

  it('should return 200 if role is author and you own the post', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    payload.postId = (await sendCreatePostRequest({ token })).body.data
      ?.id as string;

    const response = await exec();

    expect(response.status).toBe(200);
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.message).toMatch(/success/i);
  });

  describe.each(adminRoles)(
    'should return 200 and delete post if',
    async (role) => {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const post = await postService.getOneById(payload.postId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(post).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    }
  );

  it('should return 404 if post does not exist', async () => {
    payload.postId = faker.database.mongodbObjectId();

    const response = await exec();
    expect(response.status).toBe(404);
    expect(response.body.isSuccess).toBe(false);
  });
});

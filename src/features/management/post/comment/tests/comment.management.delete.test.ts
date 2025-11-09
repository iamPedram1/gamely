import { faker } from '@faker-js/faker';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateCommentService } from 'features/shared/post/comment/comment.constant';
import {
  describe200,
  describe401,
  describe403,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldOwn,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import { sendCreateCommentRequest } from 'features/client/post/comment/tests/comment.client.testUtils';
import { sendCreatePostRequest } from 'features/management/post/core/tests/post.testUtils';
import { sendDeleteCommentRequest } from 'features/management/post/comment/tests/comment.testUtils';
import { generatePostService } from 'features/shared/post/core/post.constant';

describe('DELETE /management/comments', () => {
  const postService = generatePostService();
  const commentService = generateCommentService();

  let token: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    const [user, admin] = await Promise.all([
      registerAndLogin(),
      registerAndLogin({ role: 'admin' }),
    ]);

    token = admin.accessToken;
    postId = (await sendCreatePostRequest({ token })).body.data!.id;
    commentId = (
      await sendCreateCommentRequest(postId, { token: user.accessToken })
    ).body.data!.id;
  });

  const exec = async (overwriteToken?: string) =>
    sendDeleteCommentRequest(commentId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the post', async () => {
      const [user, author] = await Promise.all([
        registerAndLogin(),
        registerAndLogin({ role: 'author' }),
      ]);
      token = author.accessToken;

      postId = (await sendCreatePostRequest({ token })).body.data?.id as string;

      commentId = (
        await sendCreateCommentRequest(postId, { token: user.accessToken })
      ).body.data!.id;

      const response = await exec();

      expectSuccess(response, 200, /success/i);
    });

    adminRoles.forEach((role) => {
      it(`and delete comment if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const comment = await commentService.getOneById(commentId, {
          lean: true,
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(comment).toBeNull();
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
    it('if comment does not exist', async () => {
      commentId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

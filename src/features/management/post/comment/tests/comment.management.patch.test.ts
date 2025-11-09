import { faker } from '@faker-js/faker';

// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateCommentService } from 'features/shared/post/comment/comment.constant';
import { sendCreatePostRequest } from 'features/management/post/core/tests/post.testUtils';
import { sendCreateCommentRequest } from 'features/client/post/comment/tests/comment.client.testUtils';
import { sendPatchCommentRequest } from 'features/management/post/comment/tests/comment.testUtils';
import {
  describe200,
  describe401,
  describe403,
  itShouldOwn,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateCommentDto } from 'features/management/post/comment/comment.management.dto';

// Types
import type { CommentLeanDocument } from 'features/shared/post/comment/comment.types';

describe('PATCH /management/comments', () => {
  let token: string;
  let payload: Partial<UpdateCommentDto> = {};
  let postId: string;
  let commentId: string;
  let before: CommentLeanDocument;
  const commentService = generateCommentService();

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
    before = await commentService.getOneById(commentId, { lean: true });
  });

  const exec = async (overwriteToken?: string) =>
    sendPatchCommentRequest(commentId, {
      payload,
      token: overwriteToken ?? token,
    });

  describe200(() => {
    it('and update comment message', async () => {
      payload.message = faker.lorem.slug({ min: 2, max: 4 });

      const response = await exec();
      const after = await commentService.getOneById(commentId, {
        lean: true,
      });

      expect(response.status).toBe(200);
      expect(before).toBeDefined();
      expect(after).toBeDefined();
      expect(before.message).not.toBe(after.message);
      expect(before.updatedAt).not.toBe(after.updatedAt);
    });

    it('even on empty object', async () => {
      payload = {};
      const response = await exec();
      expect(response.status).toBe(200);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
    itShouldOwn('author', exec, 'post');
  });
});

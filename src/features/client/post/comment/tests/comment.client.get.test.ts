import { faker } from '@faker-js/faker';

// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateCommentService } from 'features/shared/post/comment/comment.constant';
import { sendCreatePostRequest } from 'features/management/post/core/tests/post.testUtils';
import {
  generateComment,
  sendCreateCommentRequest,
  sendGetCommentRequest,
} from 'features/client/post/comment/tests/comment.client.testUtils';
import {
  describe200,
  describe404,
  expectNotFoundError,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';

describe('GET /posts/:id/comments', () => {
  const commentService = generateCommentService();

  let token: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    const [user, author] = await Promise.all([
      registerAndLogin(),
      registerAndLogin({ role: 'author' }),
    ]);

    postId = (await sendCreatePostRequest({ token: author.accessToken })).body
      .data!.id;

    commentId = (
      await sendCreateCommentRequest(postId, { token: user.accessToken })
    ).body.data!.id;

    token = user.accessToken;
  });

  const exec = async () => sendGetCommentRequest(postId);

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);

    it('and return comments', async () => {
      const res = await exec();

      res.body.data?.docs.forEach((comment) => {
        expect(comment.id).toBeDefined();
        expect(comment.createDate).toBeDefined();
        expect(comment.message).toBeDefined();
        expect(comment.user.id).toBeDefined();
        expect(comment.user.username).toBeDefined();
      });
    });

    it('and also return replies if comment has any', async () => {
      await sendCreateCommentRequest(postId, {
        payload: generateComment({ replyToComment: commentId }),
        token,
      });

      const res = await exec();

      const comment = res.body.data?.docs[0];

      expect(comment!.id).toBeDefined();
      expect(comment!.createDate).toBeDefined();
      expect(comment!.message).toBeDefined();
      expect(comment!.user.id).toBeDefined();
      expect(comment!.user.username).toBeDefined();
      expect(Array.isArray(comment!.replies)).toBe(true);
      expect(comment!.replies.length).toBeGreaterThan(0);
      expect(comment!.replies[0].id).toBeDefined();
      expect(comment!.replies[0].createDate).toBeDefined();
      expect(comment!.replies[0].message).toBeDefined();
      expect(comment!.replies[0].user.id).toBeDefined();
      expect(comment!.replies[0].user.username).toBeDefined();
    });
  });

  describe404(() => {
    it('if post does not exist', async () => {
      postId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

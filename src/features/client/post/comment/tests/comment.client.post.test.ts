import { faker } from '@faker-js/faker';

// Utils
import { generateCommentService } from 'features/shared/post/comment/comment.constant';
import { sendCreatePostRequest } from 'features/management/post/core/tests/post.testUtils';
import { CreateCommentDto } from 'features/client/post/comment/comment.client.dto';
import { sendBlockRequest } from 'features/shared/user/block/tests/block.testUtils';
import {
  generateComment,
  sendCreateCommentRequest,
} from 'features/client/post/comment/tests/comment.client.testUtils';
import {
  registerAndLogin,
  registerAndLoginBatch,
} from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe201,
  describe400,
  describe401,
  describe403,
  describe404,
  expectBadRequest,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('POST /posts/:id/comments', () => {
  const commentService = generateCommentService();

  let token: string;
  let payload: CreateCommentDto;
  let postId: string;
  let authorToken: string;

  beforeEach(async () => {
    authorToken = (await registerAndLogin({ role: 'author' })).accessToken;
    postId = (await sendCreatePostRequest({ token: authorToken }))?.body.data!
      .id;

    token = (await registerAndLogin()).accessToken;
    payload = generateComment();
  });

  const exec = async (overwriteToken?: string) =>
    sendCreateCommentRequest(postId, {
      payload,
      token: overwriteToken ?? token,
    });

  describe201(() => {
    it('and add comment to post', async () => {
      const before = await commentService.countDocuments({ post: postId });
      token = (await registerAndLogin())?.accessToken || '';

      const response = await exec();
      const after = await commentService.countDocuments({ post: postId });

      expectSuccess(response, 201, /success/i);
      expect(before).toBe(0);
      expect(after).toBe(1);
    });
    it('if its replying to a valid comment', async () => {
      // Arrange
      const userToken = (await registerAndLogin())?.accessToken || '';
      const comment = await exec(userToken);

      // Act
      token = (await registerAndLogin())?.accessToken || '';
      payload = generateComment({ replyToComment: comment.body.data!.id });
      const res = await exec();

      // Assert
      expectSuccess(res, 201, /success/i);
    });
    it('and if its replying it should set replyToComment correctly', async () => {
      // Arrange
      const userToken = (await registerAndLogin())?.accessToken || '';
      const comment = await exec(userToken);

      // Act
      token = (await registerAndLogin())?.accessToken || '';
      payload = generateComment({ replyToComment: comment.body.data!.id });
      const res = await exec();

      const firstComment = await commentService.getOneById(
        comment.body.data!.id,
        { lean: true, throwError: false }
      );
      const secondComment = await commentService.getOneById(res.body.data!.id, {
        lean: true,
        throwError: false,
      });

      // Assert
      expectSuccess(res, 201, /success/i);

      expect(firstComment).toBeDefined();
      expect(secondComment).toBeDefined();
      expect(secondComment!.replyToComment).toBeDefined();
      expect(String(secondComment!.replyToComment)).toBe(
        String(firstComment?._id)
      );
      expect(String(secondComment!.thread)).toBe(String(firstComment!._id));
    });
    it('and if its nested replying it should set threadId correctly to first top level comment.', async () => {
      // Arrange
      const [userA, userB] = await registerAndLoginBatch(2);

      const firstCmRes = await exec(userA.accessToken);
      payload = generateComment({ replyToComment: firstCmRes.body.data!.id });
      const secondCmRes = await exec(userB.accessToken);

      // Act
      token = (await registerAndLogin()).accessToken;
      payload = generateComment({ replyToComment: secondCmRes.body.data!.id });
      const thirdCmRes = await exec();

      const [firstComment, secondComment, thirdComment] = await Promise.all([
        commentService.getOneById(firstCmRes.body.data!.id, {
          lean: true,
          throwError: false,
        }),
        commentService.getOneById(secondCmRes.body.data!.id, {
          lean: true,
          throwError: false,
        }),
        commentService.getOneById(thirdCmRes.body.data!.id, {
          lean: true,
          throwError: false,
        }),
      ]);

      // Assert
      expectSuccess(thirdCmRes, 201, /success/i);

      expect(firstComment).toBeDefined();
      expect(secondComment).toBeDefined();
      expect(String(secondComment!.replyToComment)).toBeDefined();
      expect(String(secondComment!.replyToComment)).toBe(
        String(firstComment!._id)
      );
      expect(String(secondComment!.thread)).toBe(String(firstComment!._id));
      expect(thirdComment!.replyToComment).toBeDefined();
      expect(String(thirdComment!.replyToComment)).toBe(
        String(secondComment!._id)
      );
      expect(String(thirdComment!.thread)).toBe(String(firstComment!._id));
    });
  });

  describe400(() => {
    it('if its trying to reply but user is blocked', async () => {
      const [userA, userB] = await registerAndLoginBatch(2);
      await sendBlockRequest(userB.userId, { token: userA.accessToken });
      const commentA = await exec(userA.accessToken);

      payload = generateComment({ replyToComment: commentA.body.data!.id });
      const commentB = await exec(userB.accessToken);

      expectBadRequest(commentB, /blocked/i);
    });

    it('if its trying to send comment but user is blocked by author', async () => {
      const user = await registerAndLogin();
      await sendBlockRequest(user.userId, { token: authorToken });
      token = user.accessToken;

      const comment = await exec();

      expectBadRequest(comment, /blocked/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe404(() => {
    it('if post does not exist', async () => {
      postId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });

    it('if replyToComment does not exist', async () => {
      payload.replyToComment = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});

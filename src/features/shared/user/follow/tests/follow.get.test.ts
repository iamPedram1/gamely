import { faker } from '@faker-js/faker';
import { generateUserService } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendGetFollowersRequest,
  sendGetFollowingsRequest,
  sendGetProfileFollowersRequest,
  sendGetProfileFollowingsRequest,
  sendFollowRequest,
} from './follow.testUtils';
import {
  describe401,
  itShouldRequireToken,
  describe200,
  expectSuccess,
  describe404,
  expectNotFoundError,
} from 'core/utilities/testHelpers';

describe('GET /follow', () => {
  let token: string;
  let actorId: string;
  let targetUserToken: string;
  let targetUsername: string;
  const userService = generateUserService();

  beforeEach(async () => {
    const [user, target] = await Promise.all([
      registerAndLogin(),
      registerAndLogin(),
    ]);
    token = user.accessToken;
    actorId = user.userId;
    targetUserToken = target.accessToken;
    targetUsername = (
      await userService.getOneById(target.userId, { lean: true })
    ).username;

    // Make otherUser follow user
    await sendFollowRequest(target.userId, token);
  });

  describe200(() => {
    it('gets profile followers', async () => {
      const res = await sendGetProfileFollowersRequest(token);
      expectSuccess(res);
    });

    it('gets profile followings', async () => {
      const res = await sendGetProfileFollowingsRequest(token);
      expect(res.status).toBe(200);
    });

    it('gets other user followers', async () => {
      const res = await sendGetFollowersRequest(targetUsername);
      expect(res.status).toBe(200);
    });

    it('gets other user followings', async () => {
      const res = await sendGetFollowingsRequest(targetUsername);
      expect(res.status).toBe(200);
    });
  });

  describe401(() => {
    itShouldRequireToken(() => sendGetProfileFollowersRequest(''));
  });

  describe404(() => {
    it('for followers if target user does not exist', async () => {
      const res = await sendGetFollowersRequest(faker.internet.username());
      expectNotFoundError(res);
    });
    it('for followings if target user does not exist', async () => {
      const res = await sendGetFollowingsRequest(faker.internet.username());
      expectNotFoundError(res);
    });
  });
});

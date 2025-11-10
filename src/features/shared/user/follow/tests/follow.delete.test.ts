import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendUnfollowRequest, sendFollowRequest } from './follow.testUtils';
import {
  describe204,
  describe401,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import { faker } from '@faker-js/faker';

describe('DELETE /follow/:userId/unfollow', () => {
  let token: string;
  let targetId: string;

  beforeEach(async () => {
    const [user, target] = await Promise.all([
      registerAndLogin(),
      registerAndLogin(),
    ]);
    token = user.accessToken;
    targetId = target.userId;

    await sendFollowRequest(targetId, token);
  });

  const exec = (overwriteToken?: string) =>
    sendUnfollowRequest(targetId, overwriteToken ?? token);

  describe204(() => {
    it('and unfollows successfully', async () => {
      const response = await exec();

      expectSuccess(response, 204);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe404(() => {
    it('if target user does not exist', async () => {
      targetId = faker.database.mongodbObjectId();
      const res = await exec();
      expectNotFoundError(res);
    });
  });
});

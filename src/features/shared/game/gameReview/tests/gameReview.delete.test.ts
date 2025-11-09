import { faker } from '@faker-js/faker';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  describe200,
  describe401,
  describe403,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldExist,
  itShouldOwn,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';
import { generateGameReviewService } from 'features/shared/game/gameReview/gameReview.constant';
import {
  sendCreateGameReviewRequest,
  sendDeleteGameReviewRequest,
} from 'features/shared/game/gameReview/tests/gameReview.testUtils';
import { sendCreatePostRequest } from 'features/management/post/core/tests/post.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';

describe('DELETE /games/:id/reviews', () => {
  const gameReviewService = generateGameReviewService();

  let token: string;
  let reviewId: string;
  let gameId: string;

  beforeEach(async () => {
    const [user, admin] = await Promise.all([
      registerAndLogin(),
      registerAndLogin({ role: 'admin' }),
    ]);
    token = user.accessToken;

    gameId = (await sendCreateGameRequest({ token: admin.accessToken })).body
      .data!.id;

    reviewId = (
      await sendCreateGameReviewRequest(gameId, { token: user.accessToken })
    ).body.data!.id;
  });

  const exec = async (overwriteToken?: string) => {
    const res = await sendDeleteGameReviewRequest(
      gameId,
      overwriteToken ?? token
    );

    return res;
  };

  describe200(() => {
    it('if review exists', async () => {
      const response = await exec();

      expectSuccess(response);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });
});

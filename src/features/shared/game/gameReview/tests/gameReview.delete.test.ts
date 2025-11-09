// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { generateGameReviewService } from 'features/shared/game/gameReview/gameReview.constant';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
import {
  sendCreateGameReviewRequest,
  sendDeleteGameReviewRequest,
} from 'features/shared/game/gameReview/tests/gameReview.testUtils';
import {
  describe200,
  describe401,
  expectSuccess,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

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

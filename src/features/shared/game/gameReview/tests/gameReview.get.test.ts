// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
import { generateGameReviewService } from 'features/shared/game/gameReview/gameReview.constant';
import {
  describe200,
  itShouldReturnsPaginatedDocs,
} from 'core/utilities/testHelpers';

// Types
import {
  sendCreateGameReviewRequest,
  sendGetGameReviewsRequest,
} from 'features/shared/game/gameReview/tests/gameReview.testUtils';

describe('GET /game/:gameId/reviews', () => {
  let gameId: string;
  const gameReviewService = generateGameReviewService();

  beforeEach(async () => {
    const [user, admin] = await Promise.all([
      registerAndLogin(),
      registerAndLogin({ role: 'admin' }),
    ]);

    gameId = (await sendCreateGameRequest({ token: admin.accessToken })).body
      .data!.id;
    await sendCreateGameReviewRequest(gameId, { token: user.accessToken });
  });

  const exec = async () => sendGetGameReviewsRequest(gameId);

  describe200(() => {
    itShouldReturnsPaginatedDocs(exec);
    it('and return reviews correctly', async () => {
      const res = await exec();
      expect(res.body.data!.docs.length).toBe(1);
      (['rate', 'description'] as const).forEach((key) => {
        expect(res.body.data!.docs![0]).toHaveProperty(key);
      });
    });
  });
});

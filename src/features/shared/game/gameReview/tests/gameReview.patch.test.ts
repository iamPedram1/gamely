// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
import { generateGameReviewService } from 'features/shared/game/gameReview/gameReview.constant';
import {
  generateGameReview,
  sendCreateGameReviewRequest,
  sendPatchGameReviewRequest,
} from 'features/shared/game/gameReview/tests/gameReview.testUtils';
import {
  describe200,
  describe401,
  expectKeysExist,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { UpdateGameReviewDto } from 'features/shared/game/gameReview/gameReview.dto';

// Types
import type { GameReviewLeanDocument } from 'features/shared/game/gameReview/gameReview.types';

describe('PATCH /game/:id/reviews', () => {
  let token: string;
  let payload: UpdateGameReviewDto;
  let gameId: string;
  let reviewId: string;
  let before: GameReviewLeanDocument;
  const gameReviewService = generateGameReviewService();

  beforeEach(async () => {
    payload = generateGameReview();
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

    before = await gameReviewService.getOneById(reviewId, { lean: true });
  });

  const exec = async (overwriteToken?: string) =>
    sendPatchGameReviewRequest(gameId, {
      token: overwriteToken ?? token,
    });

  describe200(() => {
    it('if the payload is valid', async () => {
      const response = await exec();
      const review = await gameReviewService.getOneById(response.body.data!.id);

      expect(response.status).toBe(200);
      expect(review).toBeDefined();
      expectKeysExist(review, Object.keys(payload));
    });

    it('and return the review in response', async () => {
      const response = await exec();

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data!.rate).toBeGreaterThan(0);
      expect(response.body.data!.description).toBeDefined();
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });
});

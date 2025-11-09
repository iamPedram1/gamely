// Utils
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
import { generateGameReviewService } from 'features/shared/game/gameReview/gameReview.constant';
import {
  describe201,
  describe400,
  describe401,
  expectBadRequest,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { CreateGameReviewDto } from 'features/shared/game/gameReview/gameReview.dto';
import {
  generateGameReview,
  sendCreateGameReviewRequest,
} from 'features/shared/game/gameReview/tests/gameReview.testUtils';

describe('POST /game/:id/reviews', () => {
  let token: string;
  let gameId: string;
  let payload: CreateGameReviewDto;
  const gameReview = generateGameReviewService();

  beforeEach(async () => {
    payload = generateGameReview();
    const [user, admin] = await Promise.all([
      registerAndLogin(),
      registerAndLogin({ role: 'admin' }),
    ]);
    token = user.accessToken;
    gameId = (await sendCreateGameRequest({ token: admin.accessToken })).body
      .data!.id;
  });

  const exec = async (overwriteToken?: string) =>
    sendCreateGameReviewRequest(gameId, { token: overwriteToken ?? token });

  describe201(() => {
    it('if the payload is valid', async () => {
      const response = await exec();

      expect(response.status).toBe(201);
    });

    it('and return the review in response', async () => {
      const response = await exec();

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data!.rate).toBeGreaterThan(0);
      expect(response.body.data!.description).toBeDefined();
    });
  });

  describe400(() => {
    it('if its trying to post review twice in the same game', async () => {
      await exec();
      const res = await exec();

      expectBadRequest(res, /already/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });
});

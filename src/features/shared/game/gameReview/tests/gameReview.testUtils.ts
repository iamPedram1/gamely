import { faker } from '@faker-js/faker';

// Model
import GameReview from 'features/shared/game/gameReview/gameReview.model';

// Utilities
import { prefixBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  CreateGameReviewDto,
  GameReviewResponseDto,
  UpdateGameReviewDto,
} from 'features/shared/game/gameReview/gameReview.dto';

// Types
import type { WithPagination } from 'core/types/paginate';

const gameReviewURL = (gameId: string) =>
  prefixBaseUrl(`/games/${gameId}/reviews`);

export function generateGameReview(): CreateGameReviewDto {
  return {
    rate: faker.number.int({ min: 1, max: 5 }),
    description: faker.lorem.word({ length: { min: 10, max: 500 } }),
  };
}

export const sendCreateGameReviewRequest = async (
  gameId: string,
  options?: SendRequestOptions<CreateGameReviewDto>
) => {
  return await sendPostRequest<GameReviewResponseDto>(gameReviewURL(gameId), {
    payload: generateGameReview(),
    ...options,
  });
};

export const sendPatchGameReviewRequest = async (
  gameId: string,
  options: SendRequestOptions<UpdateGameReviewDto>
) => {
  return await sendPatchRequest<GameReviewResponseDto, UpdateGameReviewDto>(
    gameReviewURL(gameId),
    options
  );
};

export const sendGetGameReviewsRequest = async <
  T = WithPagination<GameReviewResponseDto>,
>(
  gameId: string
) => {
  return await sendGetRequest<T>(gameReviewURL(gameId));
};

export const sendDeleteGameReviewRequest = async (
  gameId: string,
  token: string
) => {
  return await sendDeleteRequest(gameReviewURL(gameId), {
    token,
  });
};

export async function createGameReview(
  gameReview: CreateGameReviewDto = generateGameReview()
) {
  return await new GameReview(gameReview).save();
}

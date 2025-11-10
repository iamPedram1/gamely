// Utils

import { WithPagination } from 'core/types/paginate';
import { prefixBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';
import { FavoriteGameResponseDto } from 'features/shared/user/favoriteGame/favoriteGame.dto';

export const favoriteGameBaseURL = (username?: string) =>
  prefixBaseUrl(
    username ? `/user/${username}/favorite-games` : '/user/favorite-games'
  );

export const sendFavoriteGameRequest = async (
  gameId: string,
  options?: SendRequestOptions<null>
) => {
  return sendPostRequest(`${favoriteGameBaseURL()}/${gameId}`, options);
};

export const sendUnfavoriteGameRequest = async (
  gameId: string,
  options?: SendRequestOptions<null>
) => {
  return sendDeleteRequest(`${favoriteGameBaseURL()}/${gameId}`, options);
};

export const sendGetFavoriteGamesRequest = async <
  T = WithPagination<FavoriteGameResponseDto>,
>(
  username: string
) => {
  return sendGetRequest<T>(favoriteGameBaseURL(username));
};

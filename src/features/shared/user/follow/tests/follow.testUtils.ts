import { WithPagination } from 'core/types/paginate';
import { prefixBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
} from 'core/utilities/supertest';
import { FollowerResponseDto } from 'features/shared/user/follow/follow.dto';

export const baseURL = prefixBaseUrl('/user/follows');

export const sendFollowRequest = async (targetId: string, token: string) =>
  sendPostRequest(`${baseURL}/${targetId}/follow`, { token });

export const sendUnfollowRequest = async (userId: string, token: string) =>
  sendDeleteRequest(`${baseURL}/${userId}/unfollow`, { token });

export const sendGetFollowersRequest = async (username: string) =>
  sendGetRequest(`${baseURL}/${username}/followers`);

export const sendGetFollowingsRequest = async (username: string) =>
  sendGetRequest(`${baseURL}/${username}/followings`);

export const sendGetProfileFollowersRequest = async <
  T = WithPagination<FollowerResponseDto>,
>(
  token: string
) => sendGetRequest<T>(`${baseURL}/followers`, { token });

export const sendGetProfileFollowingsRequest = async (token: string) =>
  sendGetRequest(`${baseURL}/followings`, { token });

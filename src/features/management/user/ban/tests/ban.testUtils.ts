import { faker } from '@faker-js/faker';

// Utilities
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import {
  BanResponseDto,
  CreateBanDto,
} from 'features/management/user/ban/ban.dto';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Types
import type { WithPagination } from 'core/types/paginate';

const banURL = prefixManagementBaseUrl('/bans');

export function generateBanPayload(payload?: CreateBanDto): CreateBanDto {
  const startAt = faker.date.soon();
  return {
    type: 'temporary',
    startAt: startAt.toISOString(),
    endAt: faker.date.soon({ days: 10, refDate: startAt }).toISOString(),
    ...payload,
  };
}

export const sendGetBansRequest = async <T = WithPagination<BanResponseDto>>(
  options?: SendRequestOptions<null>
) => await sendGetRequest<T>(banURL, options);

export const sendBanRequest = async (
  userId: string,
  options?: SendRequestOptions<CreateBanDto>
) =>
  await sendPostRequest<BanResponseDto>(`${banURL}/${userId}/ban`, {
    payload: generateBanPayload(),
    ...options,
  });

export const sendDeleteBanRequest = async (
  userId: string,
  options?: SendRequestOptions<null>
) =>
  await sendDeleteRequest<BanResponseDto>(`${banURL}/${userId}/unban`, options);

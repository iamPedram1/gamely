import { faker } from '@faker-js/faker';

// Utilities
import { prefixBaseUrl, prefixManagementBaseUrl } from 'core/utilities/configs';
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
import { BlockResponseDto } from 'features/shared/user/block/block.dto';

const blocksURL = prefixBaseUrl('/user/blocks');

export function generateBanPayload(payload?: CreateBanDto): CreateBanDto {
  const startAt = faker.date.soon();
  return {
    type: 'temporary',
    startAt: startAt.toISOString(),
    endAt: faker.date.soon({ days: 10, refDate: startAt }).toISOString(),
    ...payload,
  };
}

export const sendBlockRequest = async <T = WithPagination<BanResponseDto>>(
  targetId: string,
  options?: SendRequestOptions<null>
) => await sendPostRequest<null>(`${blocksURL}/${targetId}/block`, options);

export const sendGetBlocksRequest = async <
  T = WithPagination<BlockResponseDto>,
>(
  options?: SendRequestOptions<null>
) => await sendGetRequest<T>(blocksURL, options);

export const sendUnblockRequest = async (
  targetId: string,
  options?: SendRequestOptions<null>
) => await sendDeleteRequest<null>(`${blocksURL}/${targetId}/unblock`, options);

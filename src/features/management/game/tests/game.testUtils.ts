import { faker, fakerFA } from '@faker-js/faker';

// Utilities
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import { sendUploadFileRequest } from 'features/shared/file/test/file.testUtils';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  CreateGameDto,
  GameManagementResponseDto,
  UpdateGameDto,
} from 'features/management/game/game.management.dto';

const gameURL = prefixManagementBaseUrl('/games');

export async function generateGame(token?: string) {
  const img = await sendUploadFileRequest({
    token: token || '',
    payload: 'game',
  });

  return {
    coverImage: img?.body?.data?.id || '',
    releaseDate: faker.date.anytime().toISOString(),
    slug: faker.lorem.slug({ min: 2, max: 3 }),
    title: faker.lorem.word({ length: { min: 3, max: 255 } }).trim(),
    translations: {
      en: {
        description: faker.lorem.paragraph({ min: 4, max: 7 }).trim(),
      },
      fa: {
        description: fakerFA.lorem.paragraph({ min: 4, max: 7 }).trim(),
      },
    },
  } as CreateGameDto;
}

export const sendCreateGameRequest = async (
  options?: SendRequestOptions<CreateGameDto>
) => {
  return await sendPostRequest<GameManagementResponseDto>(gameURL, {
    payload: await generateGame(options?.token),
    ...options,
  });
};

export const sendPatchGameRequest = async (
  id: string,
  options: SendRequestOptions<UpdateGameDto>
) => {
  return await sendPatchRequest<GameManagementResponseDto, UpdateGameDto>(
    `${gameURL}/${id}`,
    options
  );
};

export const sendGetGameRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(gameURL, { token });
};

export const sendDeleteGameRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${gameURL}/${id}`, { token });
};

export const generateUserAndGame = async () => {
  const user = await registerAndLogin();
  const admin = await registerAndLogin({ role: 'admin' });
  const gameResponse = await sendCreateGameRequest({
    token: admin.accessToken,
  });
  const gameId = gameResponse.body.data!.id;
  return { user, gameId };
};

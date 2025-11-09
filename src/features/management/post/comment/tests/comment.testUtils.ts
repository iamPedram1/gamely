import { faker, fakerFA } from '@faker-js/faker';

// Utilities
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import { sendUploadFileRequest } from 'features/shared/file/test/file.testUtils';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  CommentManagementResponseDto,
  UpdateCommentDto,
} from 'features/management/post/comment/comment.management.dto';

const commentsURL = prefixManagementBaseUrl('/comments');

export async function generateComment(token?: string) {
  const img = await sendUploadFileRequest({
    token: token || '',
    payload: 'comment',
  });

  return {
    coverImage: img?.body?.data?.id || '',
    releaseDate: faker.date.anytime().toISOString(),
    slug: faker.lorem.slug({ min: 2, max: 3 }),
    translations: {
      en: {
        title: faker.book.title().trim(),
        description: faker.lorem.paragraph({ min: 4, max: 7 }).trim(),
      },
      fa: {
        title: fakerFA.book.title().trim(),
        description: fakerFA.lorem.paragraph({ min: 4, max: 7 }).trim(),
      },
    },
  } as CreateCommentDto;
}

export const sendPatchCommentRequest = async (
  id: string,
  options: SendRequestOptions<UpdateCommentDto>
) => {
  return await sendPatchRequest<CommentManagementResponseDto, UpdateCommentDto>(
    `${commentsURL}/${id}`,
    options
  );
};

export const sendGetCommentRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(commentsURL, { token });
};

export const sendDeleteCommentRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${commentsURL}/${id}`, { token });
};

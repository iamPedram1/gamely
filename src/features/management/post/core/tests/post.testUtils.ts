import { faker, fakerFA } from '@faker-js/faker';

// Model
import Post from 'features/shared/post/core/post.model';

// Utilities
import logger from 'core/utilities/logger';
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import { sendCreateCategoryRequest } from 'features/management/category/tests/category.testUtilts';
import { sendCreateTagRequest } from 'features/management/tag/tests/tag.testUtils';
import { sendUploadFileRequest } from 'features/shared/file/test/file.testUtils';
import { sendCreateGameRequest } from 'features/management/game/tests/game.testUtils';
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
  CreatePostDto,
  PostManagementResponseDto,
  UpdatePostDto,
} from 'features/management/post/core/post.management.dto';

const postsURL = prefixManagementBaseUrl('/posts');

export async function generatePostRequirements(token: string) {
  const [tag, game, category, coverImage] = await Promise.all([
    sendCreateTagRequest({ token }),
    sendCreateGameRequest({ token }),
    sendCreateCategoryRequest({ token }),
    sendUploadFileRequest({
      token,
      payload: 'post',
    }),
  ]);

  return { tag, game, category, coverImage };
}

export async function generatePost(token: string) {
  try {
    const { category, coverImage, game, tag } =
      await generatePostRequirements(token);

    return {
      slug: faker.lorem.slug({ min: 2, max: 3 }),
      category: category.body.data?.id || '',
      tags: [tag.body.data?.id || ''],
      coverImage: coverImage.body.data?.id || '',
      game: game.body.data?.id || '',
      readingTime: faker.number.int({ min: 1, max: 20 }),
      translations: {
        en: {
          title: faker.internet.displayName(),
          abstract: faker.lorem.paragraph(2),
          content: faker.lorem.paragraph(10),
        },
        fa: {
          title: fakerFA.internet.displayName(),
          abstract: fakerFA.lorem.paragraph(2),
          content: fakerFA.lorem.paragraph(10),
        },
      },
    } as CreatePostDto;
  } catch (error) {
    logger.error('🔴🔴🔴🔴🔴🔴 GENERATE POST FAILED!');
    throw error;
  }
}

export const sendCreatePostRequest = async (
  options: SendRequestOptions<CreatePostDto> & { token: string }
) => {
  const post = await generatePost(options.token);

  const res = await sendPostRequest<PostManagementResponseDto>(postsURL, {
    payload: post,
    ...options,
  });

  return res;
};

export const sendPatchPostRequest = async (
  id: string,
  options: SendRequestOptions<UpdatePostDto>
) => {
  return await sendPatchRequest<PostManagementResponseDto, UpdatePostDto>(
    `${postsURL}/${id}`,
    options
  );
};

export const sendGetPostRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(postsURL, { token });
};

export const sendDeletePostRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${postsURL}/${id}`, { token });
};

export async function createPost(post?: CreatePostDto) {
  const token = (await registerAndLogin())!.accessToken;
  return await new Post(post ?? generatePost(token)).save();
}

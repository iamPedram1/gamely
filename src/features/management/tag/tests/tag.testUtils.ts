import { faker, fakerFA } from '@faker-js/faker';

// Model
import Tag from 'features/shared/tag/tag.model';

// Utilities
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  CreateTagDto,
  TagManagementResponseDto,
  UpdateTagDto,
} from 'features/management/tag/tag.management.dto';

const tagsURL = prefixManagementBaseUrl('/tags');

export function generateTag() {
  return {
    slug: faker.lorem.slug({ min: 2, max: 3 }),
    translations: {
      en: { title: faker.internet.displayName() },
      fa: { title: fakerFA.internet.displayName() },
    },
  } as CreateTagDto;
}

export const sendCreateTagRequest = async (
  options?: SendRequestOptions<CreateTagDto>
) => {
  return await sendPostRequest<TagManagementResponseDto>(tagsURL, {
    payload: generateTag(),
    ...options,
  });
};
export const sendPatchTagRequest = async (
  id: string,
  options: SendRequestOptions<UpdateTagDto>
) => {
  return await sendPatchRequest<TagManagementResponseDto, UpdateTagDto>(
    `${tagsURL}/${id}`,
    options
  );
};

export const sendGetTagRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(tagsURL, { token });
};

export const sendDeleteTagRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${tagsURL}/${id}`, { token });
};

export async function createTag(tag: CreateTagDto = generateTag()) {
  return await new Tag(tag).save();
}

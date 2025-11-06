import { faker, fakerFA } from '@faker-js/faker';

// Model
import Category from 'features/shared/category/category.model';

// Utilities
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';
import {
  CategoryManagementResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'features/management/category/category.management.dto';

const categoriesURL = prefixManagementBaseUrl('/categories');

export function generateCategory() {
  return {
    parentId: null,
    slug: faker.lorem.slug({ min: 2, max: 5 }),
    translations: {
      en: { title: faker.internet.displayName().trim() },
      fa: { title: fakerFA.internet.displayName().trim() },
    },
  } as CreateCategoryDto;
}

export const sendCreateCategoryRequest = async (
  options?: SendRequestOptions<CreateCategoryDto>
) => {
  return await sendPostRequest<CategoryManagementResponseDto>(categoriesURL, {
    payload: generateCategory(),
    ...options,
  });
};
export const sendPatchCategoryRequest = async (
  id: string,
  options: SendRequestOptions<UpdateCategoryDto>
) => {
  return await sendPatchRequest<
    CategoryManagementResponseDto,
    UpdateCategoryDto
  >(`${categoriesURL}/${id}`, options);
};

export const sendGetCategoryRequest = async <T = any>(token: string) => {
  return await sendGetRequest<T>(categoriesURL, { token });
};

export const sendDeleteCategoryRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${categoriesURL}/${id}`, { token });
};

export async function createCategory(
  category: CreateCategoryDto = generateCategory()
) {
  return await new Category(category).save();
}

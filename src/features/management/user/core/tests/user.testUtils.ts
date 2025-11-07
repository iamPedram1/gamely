import { faker } from '@faker-js/faker';

// Utilities
import { normalizeUsername } from 'core/utilities/helperPack';
import { prefixManagementBaseUrl } from 'core/utilities/configs';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPatchRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  UserManagementResponseDto,
  UpdateUserDto,
} from 'features/management/user/core/user.management.dto';

// Types
const usersURL = prefixManagementBaseUrl('/users');

export const generateUpdateUserPayload = (
  payload?: Partial<UpdateUserDto>
): Partial<UpdateUserDto> => {
  return (
    payload ?? {
      username: normalizeUsername(faker.internet.username()),
      bio: faker.person.bio(),
    }
  );
};

export const sendPatchUserRequest = async (
  id: string,
  options: SendRequestOptions<Partial<UpdateUserDto>>
) => {
  return await sendPatchRequest<
    UserManagementResponseDto,
    Partial<UpdateUserDto>
  >(`${usersURL}/${id}`, options);
};

export const sendGetUserRequest = async <T = UserManagementResponseDto>(
  token: string,
  id?: string
) => {
  return await sendGetRequest<T>(`${usersURL}${id ? `/${id}` : ''}`, { token });
};

export const sendDeleteUserRequest = async (id: string, token: string) => {
  return await sendDeleteRequest(`${usersURL}/${id}`, { token });
};

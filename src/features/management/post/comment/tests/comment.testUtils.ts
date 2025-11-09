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

export const sendPatchCommentRequest = async (
  id: string,
  options: SendRequestOptions<Partial<UpdateCommentDto>>
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

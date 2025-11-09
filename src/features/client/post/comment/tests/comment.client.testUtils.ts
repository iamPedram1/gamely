import { faker } from '@faker-js/faker';
import { WithPagination } from 'core/types/paginate';

// Utilities
import { prefixBaseUrl } from 'core/utilities/configs';
import {
  sendGetRequest,
  sendPostRequest,
  SendRequestOptions,
} from 'core/utilities/supertest';

// Dto
import {
  CreateCommentDto,
  CommentClientResponseDto,
} from 'features/client/post/comment/comment.client.dto';

const commentsURL = (postId: string) =>
  prefixBaseUrl(`/posts/${postId}/comments`);

export function generateComment(
  payload?: Partial<CreateCommentDto>
): CreateCommentDto {
  return {
    message: faker.lorem.word({ length: { min: 10, max: 500 } }),
    ...payload,
  };
}

export const sendGetCommentRequest = async (postId: string) => {
  return await sendGetRequest<WithPagination<CommentClientResponseDto>>(
    commentsURL(postId)
  );
};

export const sendAddCommentRequest = async (
  postId: string,
  options?: SendRequestOptions<CreateCommentDto>
) => {
  return await sendPostRequest<CommentClientResponseDto>(
    commentsURL(postId),
    options
  );
};

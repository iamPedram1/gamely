import { Buffer } from 'node:buffer';

// Utilities
import { prefixBaseUrl } from 'core/utilities/configs';
import { request } from 'core/utilities/vitest.setup';
import { IApiResponse } from 'core/utilities/response';
import { FileResponseDto } from 'features/shared/file/file.dto';
import { FileLocationType } from 'features/shared/file/file.types';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';
import {
  SendRequestOptions,
  SuperTestResponse,
} from 'core/utilities/supertest';
import logger from 'core/utilities/logger';

const FAKE_IMG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
export const sendUploadFileRequest = async ({
  token,
  payload,
  noFile = false,
}: {
  token: string;
  payload: FileLocationType;
  noFile?: boolean;
}) => {
  const q = request
    .post(`${uploadURL}/${payload}`)
    .set(jwtAccessTokenName, token);

  return noFile ? q : q.attach('image', FAKE_IMG, 'test.png');
};

const uploadURL = prefixBaseUrl('/upload');

export const sendMultipleUploadFileRequest = async (
  options: SendRequestOptions<FileLocationType> & {
    token: string;
    count: number;
  }
): Promise<SuperTestResponse<IApiResponse<FileResponseDto[]>>> => {
  try {
    const q = request
      .post(`${uploadURL}/${options.payload}/batch`)
      .set(jwtAccessTokenName, options.token);

    for (let i = 0; i < options.count; i++) {
      q.attach('image', FAKE_IMG, 'test.png');
    }

    return await q;
  } catch (error) {
    logger.error('🔴🔴🔴🔴🔴🔴 UPLOAD MULTIPLE FILE FAILED!');
    throw error;
  }
};

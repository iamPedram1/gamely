import path from 'path';

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

const uploadURL = prefixBaseUrl('/upload');

const getSampleImage = (name?: string) => {
  return path.join(
    process.cwd(),
    'public/images/test',
    name || 'a-way-out.jpg'
  );
};
export const sendUploadFileRequest = async (
  options: SendRequestOptions<FileLocationType> & {
    token: string;
    noFile?: boolean;
  }
): Promise<SuperTestResponse<IApiResponse<FileResponseDto>>> => {
  let q = request
    .post(`${uploadURL}/${options.payload}`)
    .set(jwtAccessTokenName, options.token);

  return !options?.noFile ? await q.attach('image', getSampleImage()) : await q;
};

export const sendMultipleUploadFileRequest = async (
  options: SendRequestOptions<FileLocationType> & {
    token: string;
    count: number;
  }
): Promise<SuperTestResponse<IApiResponse<FileResponseDto[]>>> => {
  const q = request
    .post(`${uploadURL}/${options.payload}/batch`)
    .set(jwtAccessTokenName, options.token);

  for (let i = 0; i < options.count; i++) {
    q.attach('image', getSampleImage());
  }

  return await q;
};

import request, { Response } from 'supertest';
import { server } from 'core/utilities/vitest.setup';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';
import { BaseResponseDto } from 'core/dto/response';
import { IApiResponse } from 'core/utilities/response';

type SuperTestResponse<T> = Omit<Response, 'body'> & { body: T };
export interface SendRequestOptions<P> {
  token?: string;
  payload?: P;
}

const supertest = () => request(server);

export const sendPostRequest = async <T = null, P = unknown>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  return await supertest()
    .post(endpoint)
    .set(jwtAccessTokenName, options?.token || '')
    .send(options?.payload as any);
};

export const sendPatchRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  return await supertest()
    .patch(endpoint)
    .set(jwtAccessTokenName, options?.token || '')
    .send(options?.payload as any);
};
export const sendGetRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  return await supertest()
    .get(endpoint)
    .set(jwtAccessTokenName, options?.token || '');
};
export const sendDeleteRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  return await supertest()
    .delete(endpoint)
    .set(jwtAccessTokenName, options?.token || '');
};

export default supertest;

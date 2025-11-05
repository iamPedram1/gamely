import { Response } from 'supertest';
import { request } from 'core/utilities/vitest.setup';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';
import { IApiResponse } from 'core/utilities/response';

export type SuperTestResponse<T> = Omit<Response, 'body'> & { body: T };
export interface SendRequestOptions<P> {
  token?: string;
  payload?: P;
}

export const sendPostRequest = async <T = null, P = unknown>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  return options?.token
    ? await request
        .post(endpoint)
        .set(jwtAccessTokenName, options.token)
        .send(options?.payload as any)
    : await request.post(endpoint).send(options?.payload as any);
};

export const sendPatchRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  const q = request.patch(endpoint).send(options?.payload as any);

  return options?.token
    ? await q.set(jwtAccessTokenName, options.token)
    : await q;
};

export const sendGetRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  const q = request.get(endpoint);

  return options?.token
    ? await q.set(jwtAccessTokenName, options.token)
    : await q;
};
export const sendDeleteRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  const q = request.delete(endpoint);

  return options?.token
    ? await q.set(jwtAccessTokenName, options.token)
    : await q;
};

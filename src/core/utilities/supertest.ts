import { Response } from 'supertest';

// Utilities
import logger from 'core/utilities/logger';
import { request } from 'core/utilities/vitest.setup';
import { IApiResponse } from 'core/utilities/response';
import { jwtAccessTokenName } from 'features/shared/auth/session/session.constant';

export type SuperTestResponse<T> = Omit<Response, 'body'> & { body: T };
export interface SendRequestOptions<P> {
  token?: string;
  payload?: P;
}

export const sendPostRequest = async <T = null, P = unknown>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  try {
    return options?.token
      ? await request
          .post(endpoint)
          .set(jwtAccessTokenName, options.token)
          .send(options?.payload as any)
      : await request.post(endpoint).send(options?.payload as any);
  } catch (error) {
    logger.error(
      `🔴 SUPERTEST POST - ${error.message}`,
      error.name,
      error.stack,
      error.cause
    );
    throw error;
  }
};

export const sendPatchRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<Partial<P>>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  try {
    const q = request.patch(endpoint).send(options?.payload as any);

    return options?.token
      ? await q.set(jwtAccessTokenName, options.token)
      : await q;
  } catch (error) {
    logger.error(
      `🔴 SUPERTEST PATCH - ${error.message}`,
      error.name,
      error.stack,
      error.cause
    );
    throw error;
  }
};

export const sendGetRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  try {
    const q = request.get(endpoint);

    return options?.token
      ? await q.set(jwtAccessTokenName, options.token)
      : await q;
  } catch (error) {
    logger.error(
      `🔴 SUPERTEST GET - ${error.message}`,
      error.name,
      error.stack,
      error.cause
    );
    throw error;
  }
};
export const sendDeleteRequest = async <T = null, P = null>(
  endpoint: string,
  options?: SendRequestOptions<P>
): Promise<SuperTestResponse<IApiResponse<T>>> => {
  try {
    const q = request.delete(endpoint);

    return options?.token
      ? await q.set(jwtAccessTokenName, options.token)
      : await q;
  } catch (error) {
    logger.error(
      `🔴 SUPERTEST DELETE - ${error.message}`,
      error.name,
      error.stack,
      error.cause
    );
    throw error;
  }
};

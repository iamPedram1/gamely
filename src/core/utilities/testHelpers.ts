import { IApiResponse } from 'core/utilities/response';
import { SuperTestResponse } from 'core/utilities/supertest';
import { Response } from 'supertest';

export const expectBadRequest = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(400);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectUnauthorizedError = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(401);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectNotFoundError = (response: Response, regex?: RegExp) => {
  expect(response.status).toBe(404);
  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectSuccessGET = (
  response: SuperTestResponse<IApiResponse<any>>,
  regex?: RegExp
) => {
  expect(response.status).toBe(200);
  expect(response.body.statusCode).toBe(200);
  expect(response.body.isSuccess).toBe(true);

  if (regex) expect(response.body.message).toMatch(regex);
};

export const expectKeysExist = (obj: object, keys: string[]) => {
  keys.forEach((key) => expect(obj).toHaveProperty(key));
};

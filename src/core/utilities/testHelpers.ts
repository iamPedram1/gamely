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

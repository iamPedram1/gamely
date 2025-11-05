import { container } from 'tsyringe';

// Services
import SessionService from 'features/shared/auth/session/session.service';

// Utils
import crypto from 'core/utilities/crypto';
import tokenUtils from 'core/services/token.service';
import { prefixBaseUrl } from 'core/utilities/configs';
import { sendPostRequest } from 'core/utilities/supertest';
import {
  generateUser,
  registerAndLogin,
} from 'features/shared/auth/core/tests/auth.testUtils';

// Dto
import {
  LoginResponseDto,
  RegisterDto,
} from 'features/shared/auth/core/auth.dto';
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/auth/session/session.dto';

// Types
import { IRefreshToken } from 'features/shared/auth/session/session.types';

describe('session routes', () => {
  const sessionService = container.resolve(SessionService);

  describe('POST /token-refresh', () => {
    let token: string;
    let register: RegisterDto;
    let payload: RefreshTokenDto;

    beforeEach(async () => {
      token = '';

      register = generateUser();
      const response = await registerAndLogin({ payload: register });
      payload = { refreshToken: response!.refreshToken };
    });

    const exec = async () => await sendRefreshTokenRequest(payload, token);

    it('should return 400 if user does not have refreshToken in body', async () => {
      payload.refreshToken = '';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should rotate token if refreshToken is valid', async () => {
      const beforeJWT = tokenUtils.decode<IRefreshToken>(payload.refreshToken);
      const sessionBefore = await sessionService.getOneById(
        beforeJWT.sessionId,
        { select: '+refreshToken' }
      );

      const response = await exec();
      const afterJWT = tokenUtils.decode<IRefreshToken>(
        response.body.data!.refreshToken
      );
      const sessionAfter = await sessionService.getOneById(afterJWT.sessionId, {
        select: '+refreshToken',
      });
      const isJWTMatch = await crypto.compare(
        response.body.data!.refreshToken,
        sessionAfter.refreshToken
      );
      expect(isJWTMatch).toBe(true);
      expect(response.status).toBe(200);
      expect(sessionBefore).toBeDefined();
      expect(sessionAfter).toBeDefined();
      expect(sessionBefore.refreshToken).not.toBe(sessionAfter.refreshToken);
      expect(sessionAfter.refreshToken).toBeDefined();
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data!.accessToken.length).toBeGreaterThan(0);
      expect(response.body.data!.refreshToken.length).toBeGreaterThan(0);
    });
  });

  describe('POST /token-revoke', () => {
    let token: string;
    let register: RegisterDto;
    let payload: RevokeTokenDto;

    beforeEach(async () => {
      token = '';

      register = generateUser();
      const response = await registerAndLogin();

      payload = { refreshToken: response!.refreshToken };
    });

    const exec = async () => await sendRefreshTokenRequest(payload, token);

    it('should return 400 if user does not have refreshToken in body', async () => {
      payload.refreshToken = '';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should revoke token if refreshToken is valid', async () => {
      const sessionPrev = await sessionService.getOneByKey(
        'refreshToken',
        payload.refreshToken,
        { throwError: false }
      );

      const response = await exec();

      const sessionNext = await sessionService.getOneByKey(
        'refreshToken',
        payload.refreshToken,
        { throwError: false }
      );

      expect(response.status).toBe(200);

      expect(sessionPrev).toBeDefined();
      expect(sessionNext).toBeNull();
    });
  });
});

const refreshTokenURL = prefixBaseUrl('/auth/token/refresh');
const revokeTokenURL = prefixBaseUrl('/auth/token/revoke');

export const sendRefreshTokenRequest = async (
  payload: RefreshTokenDto,
  token: string = ''
) =>
  await sendPostRequest<LoginResponseDto>(refreshTokenURL, { token, payload });

export const sendRevokeTokenRequest = async (
  payload: RevokeTokenDto,
  token: string = ''
) => await sendPostRequest(revokeTokenURL, { token, payload });

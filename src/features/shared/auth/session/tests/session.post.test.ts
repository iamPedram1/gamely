// Utils
import crypto from 'core/utilities/crypto';
import tokenUtils from 'core/services/token.service';
import { describe200, describe400 } from 'core/utilities/testHelpers';
import { generateSessionService } from 'features/shared/auth/session/session.constant';
import { sendRefreshTokenRequest } from 'features/shared/auth/session/tests/session.testUtils';
import {
  generateUser,
  registerAndLogin,
} from 'features/shared/auth/core/tests/auth.testUtils';

// Dto
import { RegisterDto } from 'features/shared/auth/core/auth.dto';
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/auth/session/session.dto';

// Types
import type { IRefreshToken } from 'features/shared/auth/session/session.types';

describe('session routes', () => {
  const sessionService = generateSessionService();

  describe('POST /token-refresh', () => {
    let token: string;
    let register: RegisterDto;
    let payload: RefreshTokenDto;

    beforeEach(async () => {
      token = '';

      register = generateUser();
      const response = await registerAndLogin({ payload: register });
      payload = { refreshToken: response?.refreshToken || '' };
    });

    const exec = async (overwriteToken?: string) =>
      await sendRefreshTokenRequest(payload, overwriteToken ?? token);

    describe200(() => {
      it('and rotate token if refreshToken is valid', async () => {
        const beforeJWT = tokenUtils.decode<IRefreshToken>(
          payload.refreshToken
        );
        const sessionBefore = await sessionService.getOneById(
          beforeJWT.sessionId,
          { select: '+refreshToken' }
        );

        const response = await exec();
        const afterJWT = tokenUtils.decode<IRefreshToken>(
          response.body.data?.refreshToken || ''
        );
        const sessionAfter = await sessionService.getOneById(
          afterJWT.sessionId,
          {
            select: '+refreshToken',
          }
        );
        const isJWTMatch = await crypto.compare(
          response.body.data?.refreshToken || '',
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
        expect(response.body.data?.accessToken.length).toBeGreaterThan(0);
        expect(response.body.data?.refreshToken.length).toBeGreaterThan(0);
      });
    });

    describe400(() => {
      it('if user does not have refreshToken in body', async () => {
        payload.refreshToken = '';

        const response = await exec();

        expect(response.status).toBe(400);
      });
    });
  });

  describe('POST /token-revoke', () => {
    let token: string;
    let payload: RevokeTokenDto;

    beforeEach(async () => {
      token = '';

      const response = await registerAndLogin();

      payload = { refreshToken: response?.refreshToken || '' };
    });

    const exec = async (overwriteToken?: string) =>
      await sendRefreshTokenRequest(payload, overwriteToken ?? token);

    describe200(() => {
      it('and revoke token if refreshToken is valid', async () => {
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

    describe400(() => {
      it('if user does not have refreshToken in body', async () => {
        payload.refreshToken = '';

        const response = await exec();

        expect(response.status).toBe(400);
      });
    });
  });
});

import { prefixBaseUrl } from 'core/utilities/configs';
import { sendPostRequest } from 'core/utilities/supertest';
import { LoginResponseDto } from 'features/shared/auth/core/auth.dto';
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/auth/session/session.dto';

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

import dayjs from 'dayjs';
import { Response } from 'express';
import { jwtCookieExpiresInSeconds } from 'utilites/configs';

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('Token', token, {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: dayjs().add(jwtCookieExpiresInSeconds, 'seconds').toDate(),
    priority: 'high',
    sameSite: 'none',
  });
};

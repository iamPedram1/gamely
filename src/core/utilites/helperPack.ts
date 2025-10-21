import dayjs from 'dayjs';
import { Response } from 'express';
import { jwtCookieExpiresInMinutes } from 'core/utilites/configs';

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('Token', token, {
    httpOnly: false,
    secure: true,
    path: '/',
    expires: dayjs().add(jwtCookieExpiresInMinutes, 'minutes').toDate(),
    priority: 'high',
    sameSite: 'none',
  });
};

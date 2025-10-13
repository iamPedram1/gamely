import dayjs from 'dayjs';
import { Response } from 'express';
import { jwtCookieExpiresInMinuets } from 'utilites/configs';

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('Token', token, {
    httpOnly: false,
    secure: true,
    path: '/',
    expires: dayjs().add(jwtCookieExpiresInMinuets, 'minutes').toDate(),
    priority: 'high',
    sameSite: 'none',
  });
};

import dayjs from 'dayjs';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { jwtCookieExpiresInMinutes } from 'features/shared/auth/core/auth.constant';

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

export const decodeHtmlEntities = (str: string) => {
  return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
};

export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = ''
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const error of errors) {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      formatted[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(formatted, formatValidationErrors(error.children, path));
    }
  }

  return formatted;
}

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const messages: string[] = error.constraints
      ? Object.values(error.constraints)
      : [];

    if (error.children?.length) {
      messages.push(...flattenValidationErrors(error.children));
    }

    return messages;
  });
}

export function includeIf<T>(condition: boolean | any, value: T): T[] {
  return condition ? [value] : [];
}

export async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const isTestMode = process.env.NODE_ENV === 'test';

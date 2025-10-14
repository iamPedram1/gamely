import type { IUser } from 'api/user/user.types';
import type { JwtPayload } from 'jsonwebtoken';
import type { TranslationKeys, TranslationVariables } from 'startup/i18n';
import type { TFunction, i18n } from 'i18next';
import type { TypedTFunction } from 'types/i18n';

declare global {
  namespace Express {
    interface Request {
      user: Pick<IUser, 'id' | 'email'>;
      i18n: i18n;
      t: TypedTFunction;
    }
  }
}

import type { IUser, IUserContext } from 'features/shared/user/user.types';
import type { JwtPayload } from 'jsonwebtoken';
import type { TranslationKeys, TranslationVariables } from 'core/startup/i18n';
import type { TFunction, i18n } from 'i18next';
import type { TypedTFunction } from 'core/types/i18n';

declare global {
  namespace Express {
    interface Request {
      user: IUserContext;
      i18n: i18n;
      t: TypedTFunction;
      clientIp: string;
    }
  }
}

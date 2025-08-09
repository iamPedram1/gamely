// src/types/express.d.ts
import { UserProps } from 'api/user/user.types';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<UserProps, '_id', 'email'>;
    }
  }
}

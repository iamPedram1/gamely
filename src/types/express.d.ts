import { IUser } from 'api/user/user.types';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, '_id', 'email'>;
    }
  }
}

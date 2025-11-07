import { container } from 'tsyringe';
import UserService from 'features/shared/user/core/user.service';
import type {
  UserRole,
  UserStatus,
} from 'features/shared/user/core/user.types';

export const adminRoles: Array<Exclude<UserRole, 'user' | 'author'>> = [
  'admin',
  'superAdmin',
];
export const userRoles: UserRole[] = ['user', 'author', 'admin', 'superAdmin'];
export const userStatus: UserStatus[] = ['active', 'blocked'];
export const usernameRegex = /^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,255}$/;
export const generateUserService = () => container.resolve(UserService);

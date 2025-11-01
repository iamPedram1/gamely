import type {
  UserRole,
  UserStatus,
} from 'features/shared/user/core/user.types';

export const userRoles: UserRole[] = ['user', 'author', 'admin', 'superAdmin'];
export const userStatus: UserStatus[] = ['active', 'blocked'];
export const usernameRegex = /^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,20}$/;

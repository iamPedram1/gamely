import type { UserRole, UserStatus } from 'features/shared/user/user.types';

export const userRoles: UserRole[] = ['user', 'author', 'admin', 'superAdmin'];
export const userStatus: UserStatus[] = ['active', 'blocked'];

import type {
  BanStatusType,
  BanType,
} from 'features/management/user/ban/ban.types';

export const banType: BanType[] = ['permanent', 'temporary'];
export const banStatus: BanStatusType[] = ['active', 'expired'];

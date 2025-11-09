import { container } from 'tsyringe';
import BanService from 'features/management/user/ban/ban.service';
import type {
  BanStatusType,
  BanType,
} from 'features/management/user/ban/ban.types';

export const banType: BanType[] = ['permanent', 'temporary'];
export const banStatus: BanStatusType[] = ['active', 'expired'];
export const generateBanService = () => container.resolve(BanService);

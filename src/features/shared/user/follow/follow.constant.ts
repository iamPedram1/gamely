import { container } from 'tsyringe';
import FollowService from 'features/shared/user/follow/follow.service';

export const generateFollowService = () => container.resolve(FollowService);

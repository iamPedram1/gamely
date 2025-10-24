// DTO
import { BaseUserUpdate } from 'features/shared/user/user.dto';

// Types
import type { Types } from 'mongoose';

// <----------------   UPDATE   ---------------->
export class UpdateProfileDto extends BaseUserUpdate {
  bio: string;
  name: string;
  password: string;
  avatar: Types.ObjectId;
}

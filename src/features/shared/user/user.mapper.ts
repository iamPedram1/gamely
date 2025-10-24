import { singleton } from 'tsyringe';

// DTO
import {
  UserResponseDto,
  UserSummaryResponseDto,
} from 'features/shared/user/user.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';

// Types
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/user.model';

export type IUserMapper = InstanceType<typeof UserMapper>;

@singleton()
export class UserMapper extends BaseMapper<
  UserDocument,
  UserLeanDocument,
  UserResponseDto,
  UserSummaryResponseDto
> {
  constructor() {
    super(UserResponseDto, UserSummaryResponseDto);
  }
}

import { singleton } from 'tsyringe';

// Dto
import { UserResponseDto, UserSummaryResponseDto } from 'api/user/user.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import type { UserDocument, UserLeanDocument } from 'api/user/user.model';

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

// Model
import { UserDocument, UserLeanDocument } from 'api/user/user.model';

// Dto
import { UserResponseDto, UserSummaryResponseDto } from 'api/user/user.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export interface IUserMapper {
  toDto: (tag: UserDocument | UserLeanDocument) => UserResponseDto;
  toSummaryDto: (
    tag: UserDocument | UserLeanDocument
  ) => UserSummaryResponseDto;
}

export class UserMapper
  extends BaseMapper<
    UserDocument,
    UserLeanDocument,
    UserResponseDto,
    UserSummaryResponseDto
  >
  implements IUserMapper
{
  constructor() {
    super(UserResponseDto, UserSummaryResponseDto);
  }
}
